import { config } from "@/lib/server/config";
import { preflight, withCors } from "@/lib/server/cors";
import { queuePosition, readJob } from "@/lib/server/jobs";

/** État d'un traitement : étape en cours, avancement et shorts produits. */
export async function GET(request: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  const { id } = await ctx.params;
  const job = await readJob(id);
  if (!job) {
    return withCors(request, Response.json({ error: "Ce projet est introuvable ou a expiré." }, { status: 404 }));
  }
  return withCors(
    request,
    Response.json(
      {
        ...job,
        userId: undefined,
        queuePosition: job.status === "queued" ? queuePosition(id) : 0,
        // L'envoi d'un fichier n'est proposé en secours que si le serveur l'autorise.
        canUpload: config.allowUpload,
      },
      { headers: { "Cache-Control": "no-store" } },
    ),
  );
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
