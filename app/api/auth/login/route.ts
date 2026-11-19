import { AccountError, logIn, toAccount } from "@/lib/server/auth";
import { config } from "@/lib/server/config";
import { api, readJson } from "@/lib/server/http";
import { allowAttempt } from "@/lib/server/limits";

export { OPTIONS } from "@/lib/server/http";

/** Ouvre une session à partir d'une adresse e-mail et d'un mot de passe. */
export const POST = api(async (request) => {
  if (!allowAttempt(request, "login", 10, 10 * 60 * 1000)) {
    throw new AccountError("Trop de tentatives de connexion. Réessaie dans quelques minutes.", 429);
  }
  const { token, user } = logIn(await readJson(request));
  return Response.json({ token, account: toAccount(user, config.jobTtlHours) });
});
