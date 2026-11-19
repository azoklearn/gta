import { queuePosition, readJob } from "@/lib/server/jobs";

/** État d'un traitement : étape en cours, avancement et shorts produits. */
export async function GET(_request: Request, ctx: RouteContext<"/api/jobs/[id]">) {
  const { id } = await ctx.params;
  const job = await readJob(id);
  if (!job) return Response.json({ error: "Ce projet est introuvable ou a expiré." }, { status: 404 });
  return Response.json(
    { ...job, queuePosition: job.status === "queued" ? queuePosition(id) : 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
