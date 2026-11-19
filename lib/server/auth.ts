import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { type Account, findPlan, FREE_TRIAL, PLANS, type PlanId } from "@/lib/plans";
import { config } from "./config";
import { db, type UserRow } from "./db";
import { isJobId } from "./jobs";

const SESSION_DAYS = 60;
/** Délai laissé à Mollie pour réessayer un prélèvement avant de couper l'offre. */
const GRACE_MS = 3 * 24 * 3600 * 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Une erreur de saisie, dont le message peut être montré tel quel. */
export class AccountError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

function openSession(userId: string): string {
  const token = randomBytes(32).toString("base64url");
  db()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .run(sha256(token), userId, Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  return token;
}

function readCredentials(body: unknown): { email: string; password: string } {
  const data = (body ?? {}) as { email?: unknown; password?: unknown };
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  if (!EMAIL.test(email) || email.length > 200) throw new AccountError("Cette adresse e-mail n'est pas valide.");
  return { email, password };
}

/** Crée un compte et ouvre une session. */
export function signUp(body: unknown): { token: string; user: UserRow } {
  const { email, password } = readCredentials(body);
  if (password.length < 8) throw new AccountError("Choisis un mot de passe d'au moins 8 caractères.");
  if (password.length > 200) throw new AccountError("Ce mot de passe est trop long.");
  const existing = db().prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) throw new AccountError("Un compte existe déjà avec cette adresse. Connecte-toi.", 409);

  const id = randomUUID();
  db()
    .prepare("INSERT INTO users (id, email, password_hash, created_at, credits) VALUES (?, ?, ?, ?, ?)")
    .run(id, email, hashPassword(password), Date.now(), FREE_TRIAL.shorts);
  return { token: openSession(id), user: withGift(getUser(id)!) };
}

export function logIn(body: unknown): { token: string; user: UserRow } {
  const { email, password } = readCredentials(body);
  const user = db().prepare("SELECT * FROM users WHERE email = ?").get(email) as unknown as UserRow | undefined;
  // Le mot de passe est vérifié même si le compte n'existe pas, pour ne pas révéler quelles adresses sont inscrites.
  const ok = passwordMatches(password, user?.password_hash ?? hashPassword("inconnu", "00"));
  if (!user || !ok) throw new AccountError("Adresse e-mail ou mot de passe incorrect.", 401);
  return { token: openSession(user.id), user: withGift(expireIfOverdue(user)) };
}

function bearer(request: Request): string | null {
  return request.headers.get("authorization")?.match(/^Bearer\s+([\w-]{20,})$/i)?.[1] ?? null;
}

export function logOut(request: Request): void {
  const token = bearer(request);
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
}

export function getUser(id: string): UserRow | null {
  return (db().prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as UserRow | undefined) ?? null;
}

/** Utilisateur connecté d'après l'en-tête `Authorization`, ou `null`. */
export function currentUser(request: Request): UserRow | null {
  const token = bearer(request);
  if (!token) return null;
  const session = db()
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?")
    .get(sha256(token)) as { user_id: string; expires_at: number } | undefined;
  if (!session || session.expires_at < Date.now()) return null;
  const user = getUser(session.user_id);
  return user ? withGift(expireIfOverdue(user)) : null;
}

const GIFT_DAYS = 30;

/**
 * Offre la formule la plus haute aux comptes listés dans `VICECLIP_FREE_ACCOUNTS`, sans paiement.
 * Le quota de shorts est remis à neuf tous les 30 jours. Un compte qui paie déjà un abonnement
 * n'est pas touché.
 */
function withGift(user: UserRow): UserRow {
  if (!config.freeAccounts.has(user.email) || user.subscription_status === "active") return user;
  const top = PLANS[PLANS.length - 1];
  if (user.subscription_status === "gift" && user.plan === top.id && (user.period_end ?? 0) > Date.now()) return user;
  db()
    .prepare("UPDATE users SET plan = ?, credits = ?, period_end = ?, subscription_status = 'gift', payment_failed = 0 WHERE id = ?")
    .run(top.id, top.shortsPerMonth, Date.now() + GIFT_DAYS * 24 * 3600 * 1000, user.id);
  return getUser(user.id)!;
}

/**
 * Coupe l'offre quand la période payée est dépassée sans renouvellement (abonnement résilié ou
 * prélèvements définitivement en échec) : il n'existe pas de notification Mollie pour la fin d'un abonnement.
 */
function expireIfOverdue(user: UserRow): UserRow {
  if (!user.plan || !user.period_end) return user;
  const limit = user.subscription_status === "active" ? user.period_end + GRACE_MS : user.period_end;
  if (Date.now() <= limit) return user;
  db()
    .prepare(
      "UPDATE users SET plan = NULL, credits = 0, period_end = NULL, subscription_status = NULL, payment_failed = 0, mollie_subscription_id = NULL WHERE id = ?",
    )
    .run(user.id);
  return getUser(user.id)!;
}

/** Ce que l'offre du compte autorise pour un découpage. */
export function entitlements(user: UserRow): { shortsPerVideo: number; maxMinutes: number; priority: number } {
  return findPlan(user.plan) ?? FREE_TRIAL;
}

/**
 * Réserve des shorts sur le compte pour un découpage : au plus `wanted`, au plus ce qu'il reste.
 * Renvoie le nombre réservé (0 si le compte est vide). Lecture et écriture se suivent sans pause :
 * aucune autre requête ne peut s'intercaler.
 */
export function reserveShorts(userId: string, wanted: number): number {
  const row = db().prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number } | undefined;
  const taken = Math.max(0, Math.min(Math.floor(wanted), row?.credits ?? 0));
  if (taken > 0) db().prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(taken, userId);
  return taken;
}

/** Rend au compte les shorts réservés qui n'ont pas été produits. */
export function refundShorts(userId: string, count: number): void {
  if (count > 0) db().prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(count, userId);
}

export function rememberJob(userId: string, jobId: string, title: string): void {
  db()
    .prepare("INSERT OR REPLACE INTO user_jobs (job_id, user_id, title, created_at) VALUES (?, ?, ?, ?)")
    .run(jobId, userId, title.slice(0, 200), Date.now());
}

export function renameJob(jobId: string, title: string): void {
  if (isJobId(jobId)) db().prepare("UPDATE user_jobs SET title = ? WHERE job_id = ?").run(title.slice(0, 200), jobId);
}

/** Vue du compte envoyée au navigateur. */
export function toAccount(user: UserRow, jobTtlHours: number): Account {
  const since = Date.now() - jobTtlHours * 3600 * 1000;
  const projects = db()
    .prepare("SELECT job_id AS id, title, created_at AS createdAt FROM user_jobs WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC LIMIT 12")
    .all(user.id, since) as unknown as Account["projects"];
  return {
    email: user.email,
    plan: (findPlan(user.plan)?.id ?? null) as PlanId | null,
    credits: user.credits,
    periodEnd: user.period_end,
    subscription: user.subscription_status === "active" || user.subscription_status === "canceled" ? user.subscription_status : null,
    paymentFailed: Boolean(user.payment_failed),
    gifted: user.subscription_status === "gift",
    projects,
  };
}
