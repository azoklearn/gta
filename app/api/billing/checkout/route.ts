import { AccountError } from "@/lib/server/auth";
import { startCheckout } from "@/lib/server/billing";
import { allowedOrigin } from "@/lib/server/cors";
import { api, readJson, requireUser } from "@/lib/server/http";

export { OPTIONS } from "@/lib/server/http";

/** Démarre la souscription à une offre et renvoie l'adresse de la page de paiement Mollie. */
export const POST = api(async (request) => {
  const user = requireUser(request);
  const body = (await readJson(request)) as { plan?: unknown } | null;
  // Après le paiement, Mollie renvoie l'acheteur sur le site d'où il vient (autorisé), ou sur ce serveur.
  const site = allowedOrigin(request) ?? new URL(request.url).origin;
  try {
    return Response.json({ checkoutUrl: await startCheckout(user, body?.plan, site) });
  } catch (err) {
    if (err instanceof AccountError) throw err;
    console.error("[viceclip:paiement] création du paiement en échec", err);
    throw new AccountError("Le paiement n'a pas pu être préparé. Réessaie dans un instant.", 502);
  }
});
