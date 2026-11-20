import { preflight, withCors } from "@/lib/server/cors";
import { parseYouTubeId } from "@/lib/youtube";

type Video = { id: string; title: string | null; channel: string | null; thumbnail: string };

const known = new Map<string, Video>();
const MAX_KNOWN = 500;

/**
 * Reconnaît une vidéo YouTube à partir de son lien : identifiant, miniature et, quand YouTube les
 * donne, titre et chaîne. Passe par l'interface publique d'intégration (oEmbed), sans télécharger la vidéo.
 */
export async function GET(request: Request) {
  const id = parseYouTubeId(new URL(request.url).searchParams.get("url") ?? "");
  if (!id) return withCors(request, Response.json({ error: "Ce lien n'est pas une vidéo YouTube." }, { status: 400 }));

  let video = known.get(id);
  if (!video) {
    video = { id, title: null, channel: null, thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
    try {
      const address = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
      const reply = await fetch(address, { signal: AbortSignal.timeout(5000) });
      if (reply.ok) {
        const data = (await reply.json()) as { title?: string; author_name?: string };
        video.title = data.title?.slice(0, 200) ?? null;
        video.channel = data.author_name?.slice(0, 100) ?? null;
        if (known.size >= MAX_KNOWN) known.delete(known.keys().next().value!);
        known.set(id, video);
      }
    } catch {
      // YouTube injoignable : la miniature suffit pour montrer la vidéo.
    }
  }
  return withCors(request, Response.json(video, { headers: { "Cache-Control": "public, max-age=3600" } }));
}

export function OPTIONS(request: Request) {
  return preflight(request);
}
