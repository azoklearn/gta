import { AccountError, signUp, toAccount } from "@/lib/server/auth";
import { config } from "@/lib/server/config";
import { api, readJson } from "@/lib/server/http";
import { allowAttempt } from "@/lib/server/limits";

export { OPTIONS } from "@/lib/server/http";

/** Crée un compte et ouvre une session. */
export const POST = api(async (request) => {
  if (!allowAttempt(request, "signup", 5, 60 * 60 * 1000)) {
    throw new AccountError("Trop de comptes créés depuis cette connexion. Réessaie dans une heure.", 429);
  }
  const { token, user } = signUp(await readJson(request));
  return Response.json({ token, account: toAccount(user, config.jobTtlHours) }, { status: 201 });
});
