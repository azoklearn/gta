import { toAccount } from "@/lib/server/auth";
import { config } from "@/lib/server/config";
import { api, requireUser } from "@/lib/server/http";

export { OPTIONS } from "@/lib/server/http";

/** Compte de l'utilisateur connecté : offre, shorts restants, projets récents. */
export const GET = api((request) => {
  return Response.json(toAccount(requireUser(request), config.jobTtlHours), { headers: { "Cache-Control": "no-store" } });
});
