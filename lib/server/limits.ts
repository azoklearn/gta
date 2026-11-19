import { config } from "./config";
import { queuedCount } from "./jobs";

const WINDOW_MS = 60 * 60 * 1000;

const globalForLimits = globalThis as unknown as { __viceclipHits?: Map<string, number[]> };
const hits = (globalForLimits.__viceclipHits ??= new Map<string, number[]>());

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

/** Compte une tentative pour cette adresse dans un « seau » donné ; renvoie `false` si la limite est dépassée. */
export function allowAttempt(request: Request, bucket: string, max: number, windowMs: number): boolean {
  const key = `${bucket}:${clientKey(request)}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  const allowed = recent.length < max;
  if (allowed) recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return allowed;
}

/**
 * Vérifie qu'un nouveau découpage peut être accepté : file d'attente non saturée.
 * Renvoie une réponse d'erreur, ou `null` si tout va bien.
 */
export function refuseIfBusy(): Response | null {
  if (queuedCount() >= config.maxQueued) {
    return Response.json(
      { error: "Beaucoup de vidéos sont en cours de découpage. Réessaie dans quelques minutes." },
      { status: 429 },
    );
  }
  return null;
}
