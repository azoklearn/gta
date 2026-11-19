import { AccountError, getUser, toAccount } from "@/lib/server/auth";
import { cancelSubscription } from "@/lib/server/billing";
import { config } from "@/lib/server/config";
import { api, requireUser } from "@/lib/server/http";

export { OPTIONS } from "@/lib/server/http";

/** Résilie l'abonnement de l'utilisateur connecté, à sa demande. */
export const POST = api(async (request) => {
  const user = requireUser(request);
  try {
    await cancelSubscription(user);
  } catch (err) {
    if (err instanceof AccountError) throw err;
    throw new AccountError("La résiliation n'a pas abouti. Réessaie dans un instant ou contacte-nous.", 502);
  }
  return Response.json(toAccount(getUser(user.id)!, config.jobTtlHours));
});
