import { api, readJson, requireUser } from "@/lib/server/http";
import { launchJob } from "@/lib/server/launch";
import { refuseIfBusy } from "@/lib/server/limits";
import { refuseIfUnavailable } from "@/lib/server/preflight";
import { parseYouTubeId } from "@/lib/youtube";

export { OPTIONS } from "@/lib/server/http";

/** Lance le découpage d'une vidéo YouTube pour l'utilisateur connecté. */
export const POST = api(async (request) => {
  const body = (await readJson(request)) as { url?: unknown } | null;
  const videoId = typeof body?.url === "string" ? parseYouTubeId(body.url) : null;
  if (!videoId) {
    return Response.json({ error: "Ce lien ne ressemble pas à une vidéo YouTube." }, { status: 400 });
  }
  const user = requireUser(request);
  const refusal = (await refuseIfUnavailable("youtube")) ?? refuseIfBusy();
  if (refusal) return refusal;

  const job = await launchJob(user, {
    kind: "youtube",
    title: "Vidéo YouTube",
    videoId,
    // Le lien est reconstruit à partir de l'identifiant : rien d'autre que saisit l'utilisateur n'atteint yt-dlp.
    url: `https://www.youtube.com/watch?v=${videoId}`,
  });
  return Response.json({ id: job.id }, { status: 201 });
});
