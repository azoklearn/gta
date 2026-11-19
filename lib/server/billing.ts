import { Client } from "mollie-api-typescript";
import { findPlan, type Plan } from "@/lib/plans";
import { AccountError, getUser } from "./auth";
import { config } from "./config";
import { db, type UserRow } from "./db";

/** Client Mollie, ou `null` tant qu'aucune clé d'API n'est réglée. */
function mollie(): Client | null {
  if (!config.mollieApiKey) return null;
  return new Client({
    security: { apiKey: config.mollieApiKey },
    ...(config.mollieApiUrl ? { serverURL: config.mollieApiUrl } : {}),
  });
}

export function billingReady(): boolean {
  return Boolean(config.mollieApiKey && config.publicUrl);
}

const euros = (plan: Plan) => ({ currency: "EUR", value: plan.price.toFixed(2) });
const webhookUrl = () => `${config.publicUrl}/api/billing/webhook`;

function addMonth(from: Date): Date {
  const next = new Date(from);
  next.setUTCMonth(next.getUTCMonth() + 1);
  // Un 31 janvier donnerait début mars : on reste sur le dernier jour du mois suivant.
  if (next.getUTCDate() !== from.getUTCDate()) next.setUTCDate(0);
  return next;
}

function log(event: string, details: Record<string, unknown>): void {
  console.log(`[viceclip:paiement] ${event} ${JSON.stringify(details)}`);
}

/**
 * Lance la souscription à une offre : crée le client Mollie si besoin, puis le premier paiement.
 * Ce premier paiement règle le premier mois et enregistre le moyen de paiement pour les suivants.
 * Renvoie l'adresse de la page de paiement Mollie.
 */
export async function startCheckout(user: UserRow, planId: unknown, siteUrl: string): Promise<string> {
  const plan = findPlan(planId);
  if (!plan) throw new AccountError("Cette offre n'existe pas.");
  const client = mollie();
  if (!client || !config.publicUrl) throw new AccountError("Le paiement n'est pas encore activé sur ce site.", 503);
  if (user.plan === plan.id && user.subscription_status === "active") {
    throw new AccountError(`Tu es déjà abonné à l'offre ${plan.name}.`, 409);
  }

  let customerId = user.mollie_customer_id;
  if (!customerId) {
    const customer = await client.customers.create({
      entityCustomer: { email: user.email, metadata: { userId: user.id } },
    });
    customerId = customer.id;
    db().prepare("UPDATE users SET mollie_customer_id = ? WHERE id = ?").run(customerId, user.id);
  }

  const payment = await client.payments.create({
    paymentRequest: {
      amount: euros(plan),
      description: `ViceClip ${plan.name} : premier mois`,
      redirectUrl: `${siteUrl}/compte?paiement=retour`,
      webhookUrl: webhookUrl(),
      sequenceType: "first",
      customerId,
      metadata: { userId: user.id, plan: plan.id },
    },
  });
  const checkout = payment.links.checkout?.href;
  if (!checkout) throw new AccountError("Mollie n'a pas renvoyé de page de paiement. Réessaie dans un instant.", 502);

  db()
    .prepare("INSERT OR REPLACE INTO payments (id, user_id, plan, kind, status, created_at) VALUES (?, ?, ?, 'first', ?, ?)")
    .run(payment.id, user.id, plan.id, payment.status, Date.now());
  log("premier paiement créé", { user: user.id, plan: plan.id, payment: payment.id });
  return checkout;
}

/** Active l'offre sur le compte : remet le compteur de shorts au quota du mois et repousse l'échéance. */
function grantMonth(userId: string, plan: Plan, subscriptionId: string | null): void {
  db()
    .prepare(
      "UPDATE users SET plan = ?, credits = ?, period_end = ?, subscription_status = 'active', payment_failed = 0, mollie_subscription_id = coalesce(?, mollie_subscription_id) WHERE id = ?",
    )
    .run(plan.id, plan.shortsPerMonth, addMonth(new Date()).getTime(), subscriptionId, userId);
}

/**
 * Traite une notification Mollie. L'état réel est toujours relu auprès de Mollie : le contenu de la
 * notification n'est qu'un identifiant. Rejouer la même notification ne crédite pas deux fois.
 */
export async function handlePaymentNotification(paymentId: string): Promise<void> {
  const client = mollie();
  if (!client) return;
  const payment = await client.payments.get({ paymentId });
  const metadata = (payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {}) as {
    userId?: string;
    plan?: string;
  };

  const known = db().prepare("SELECT user_id, plan, credited FROM payments WHERE id = ?").get(payment.id) as
    | { user_id: string; plan: string; credited: number }
    | undefined;
  const byCustomer = payment.customerId
    ? (db().prepare("SELECT * FROM users WHERE mollie_customer_id = ?").get(payment.customerId) as unknown as UserRow | undefined)
    : undefined;
  const user = getUser(known?.user_id ?? metadata.userId ?? "") ?? byCustomer ?? null;
  if (!user) return log("notification ignorée : compte inconnu", { payment: payment.id });
  // Le compte doit être celui du client Mollie qui a payé.
  if (payment.customerId && user.mollie_customer_id && payment.customerId !== user.mollie_customer_id) {
    return log("notification ignorée : client différent", { payment: payment.id, user: user.id });
  }

  const recurring = Boolean(payment.subscriptionId);
  const plan = findPlan(known?.plan ?? metadata.plan ?? user.plan);
  if (!plan) return log("notification ignorée : offre inconnue", { payment: payment.id, user: user.id });

  db()
    .prepare(
      "INSERT INTO payments (id, user_id, plan, kind, status, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status",
    )
    .run(payment.id, user.id, plan.id, recurring ? "recurring" : "first", payment.status, Date.now());
  log("notification", { payment: payment.id, user: user.id, status: payment.status, recurring });

  if (payment.status === "paid") {
    // Marquer d'abord, créditer ensuite : une seconde notification pour le même paiement s'arrête ici.
    const first = db().prepare("UPDATE payments SET credited = 1 WHERE id = ? AND credited = 0").run(payment.id);
    if (first.changes === 0) return;

    if (recurring) {
      if (payment.subscriptionId !== user.mollie_subscription_id) {
        return log("prélèvement d'un ancien abonnement, non crédité", { payment: payment.id, user: user.id });
      }
      grantMonth(user.id, plan, null);
      return log("mois renouvelé", { user: user.id, plan: plan.id });
    }

    // Premier paiement réussi : l'offre est activée tout de suite, quoi qu'il arrive ensuite.
    grantMonth(user.id, plan, null);
    log("offre activée", { user: user.id, plan: plan.id });

    // En cas de changement d'offre, l'ancien abonnement est arrêté avant d'en ouvrir un nouveau,
    // pour ne jamais prélever deux abonnements en même temps.
    if (user.mollie_subscription_id && user.mollie_customer_id) {
      try {
        await stopSubscription(client, user.mollie_customer_id, user.mollie_subscription_id, user.id, "changement d'offre");
      } catch {
        return log("ancien abonnement non résilié : le nouveau n'est pas créé", { user: user.id });
      }
    }
    const customerId = payment.customerId ?? user.mollie_customer_id!;
    const subscriptionId = await openSubscription(client, customerId, plan, user.id, payment.mandateId ?? undefined);
    if (subscriptionId) {
      db().prepare("UPDATE users SET mollie_subscription_id = ? WHERE id = ?").run(subscriptionId, user.id);
      return log("abonnement créé", { user: user.id, plan: plan.id, subscription: subscriptionId });
    }
    // Sans abonnement, le mois payé reste acquis mais ne sera pas renouvelé.
    db()
      .prepare("UPDATE users SET subscription_status = 'canceled', mollie_subscription_id = NULL WHERE id = ?")
      .run(user.id);
    return log("abonnement non créé : le mois payé ne sera pas renouvelé", { user: user.id, plan: plan.id });
  }

  if (recurring && ["failed", "expired", "canceled"].includes(payment.status)) {
    // Mollie réessaie de lui-même : on signale seulement le problème sur le compte.
    if (payment.subscriptionId === user.mollie_subscription_id) {
      db().prepare("UPDATE users SET payment_failed = 1 WHERE id = ?").run(user.id);
    }
  }
}

/**
 * Ouvre l'abonnement mensuel, dont le premier prélèvement tombera dans un mois.
 * Si la création échoue, on vérifie d'abord chez Mollie qu'elle n'a pas abouti malgré l'erreur :
 * relancer à l'aveugle risquerait de créer deux abonnements, donc deux prélèvements.
 */
async function openSubscription(
  client: Client,
  customerId: string,
  plan: Plan,
  userId: string,
  mandateId: string | undefined,
): Promise<string | null> {
  const today = new Date();
  const description = `ViceClip ${plan.name} (depuis le ${today.toISOString().slice(0, 10)}, ${today.getTime().toString(36)})`;
  try {
    const subscription = await client.subscriptions.create({
      customerId,
      subscriptionRequest: {
        amount: euros(plan),
        interval: "1 month",
        startDate: addMonth(today).toISOString().slice(0, 10),
        description,
        webhookUrl: webhookUrl(),
        ...(mandateId ? { mandateId } : {}),
        metadata: { userId, plan: plan.id },
      },
    });
    return subscription.id;
  } catch (err) {
    log("création de l'abonnement en erreur, vérification chez Mollie", { user: userId, error: String(err).slice(0, 160) });
    try {
      const page = await client.subscriptions.list({ customerId });
      const existing = page.result.embedded.subscriptions?.find((s) => s.description === description && s.status === "active");
      return existing?.id ?? null;
    } catch {
      return null;
    }
  }
}

async function stopSubscription(client: Client, customerId: string, subscriptionId: string, userId: string, reason: string) {
  log("résiliation demandée", { user: userId, subscription: subscriptionId, reason });
  try {
    const current = await client.subscriptions.get({ customerId, subscriptionId });
    if (current.status === "active" || current.status === "pending" || current.status === "suspended") {
      await client.subscriptions.cancel({ customerId, subscriptionId });
    }
    log("résiliation effectuée", { user: userId, subscription: subscriptionId, before: current.status });
  } catch (err) {
    log("résiliation en échec", { user: userId, subscription: subscriptionId, error: String(err).slice(0, 200) });
    throw err;
  }
}

/**
 * Résilie l'abonnement à la demande de l'utilisateur. Plus aucun prélèvement n'aura lieu ;
 * l'offre et les shorts restants restent utilisables jusqu'à la fin de la période déjà payée.
 */
export async function cancelSubscription(user: UserRow): Promise<void> {
  const client = mollie();
  if (!client) throw new AccountError("Le paiement n'est pas encore activé sur ce site.", 503);
  if (!user.mollie_subscription_id || !user.mollie_customer_id || user.subscription_status !== "active") {
    throw new AccountError("Aucun abonnement actif à résilier.", 409);
  }
  await stopSubscription(client, user.mollie_customer_id, user.mollie_subscription_id, user.id, "demande de l'utilisateur");
  db().prepare("UPDATE users SET subscription_status = 'canceled', payment_failed = 0 WHERE id = ?").run(user.id);
}
