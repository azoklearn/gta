import { createJob, enqueue, removeExpiredJobs } from "@/lib/server/jobs";
import { refuseIfBusy } from "@/lib/server/limits";
import { runJob } from "@/lib/server/pipeline";
import { refuseIfUnavailable, unexpectedError } from "@/lib/server/preflight";
import { parseYouTubeId } from "@/lib/youtube";

/** Lance le découpage d'une vidéo YouTube. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    const videoId = typeof body?.url === "string" ? parseYouTubeId(body.url) : null;
    if (!videoId) {
      return Response.json({ error: "Ce lien ne ressemble pas à une vidéo YouTube." }, { status: 400 });
    }
    const refusal = (await refuseIfUnavailable("youtube")) ?? refuseIfBusy(request);
    if (refusal) return refusal;

    void removeExpiredJobs().catch(() => {});
    const job = await createJob({
      kind: "youtube",
      title: "Vidéo YouTube",
      videoId,
      // Le lien est reconstruit à partir de l'identifiant : rien d'autre que saisit l'utilisateur n'atteint yt-dlp.
      url: `https://www.youtube.com/watch?v=${videoId}`,
    });
    enqueue(job.id, runJob);
    return Response.json({ id: job.id }, { status: 201 });
  } catch (err) {
    return unexpectedError(err);
  }
}
