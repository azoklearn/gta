import fs from "node:fs/promises";
import { posterPath, readJob } from "@/lib/server/jobs";

/** Image de la vidéo d'origine, prise au début du meilleur passage. */
export async function GET(_request: Request, ctx: RouteContext<"/api/jobs/[id]/poster">) {
  const { id } = await ctx.params;
  const job = await readJob(id);
  const image = job ? await fs.readFile(posterPath(id)).catch(() => null) : null;
  if (!image) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
  });
}
