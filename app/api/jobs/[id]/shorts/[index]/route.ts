import fs from "node:fs/promises";
import { clipPath, readJob } from "@/lib/server/jobs";

const CHUNK = 256 * 1024;

/**
 * Lit les octets [start, end] d'un fichier à la demande du lecteur.
 * Le fichier est refermé proprement quand le navigateur interrompt la lecture.
 */
function fileStream(file: string, start: number, end: number): ReadableStream<Uint8Array> {
  let handle: fs.FileHandle | null = null;
  let position = start;
  return new ReadableStream({
    async pull(controller) {
      handle ??= await fs.open(file, "r");
      const size = Math.min(CHUNK, end - position + 1);
      const chunk = new Uint8Array(Math.max(0, size));
      const { bytesRead } = size > 0 ? await handle.read(chunk, 0, size, position) : { bytesRead: 0 };
      if (bytesRead === 0) {
        await handle.close();
        handle = null;
        controller.close();
        return;
      }
      position += bytesRead;
      controller.enqueue(chunk.subarray(0, bytesRead));
    },
    async cancel() {
      await handle?.close();
      handle = null;
    },
  });
}

/**
 * Sert un short (ou sa vignette avec `?thumb=1`).
 * Les requêtes partielles sont gérées pour que le lecteur puisse se déplacer dans la vidéo.
 * `?download=1` propose le fichier au téléchargement.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/jobs/[id]/shorts/[index]">) {
  const { id, index } = await ctx.params;
  const url = new URL(request.url);
  const job = await readJob(id);
  const clip = job?.clips.find((c) => String(c.index) === index);
  if (!job || !clip || clip.index > job.rendered) return new Response("Introuvable", { status: 404 });

  const thumb = url.searchParams.has("thumb");
  const file = clipPath(id, clip.index, thumb ? "jpg" : "mp4");
  const stat = await fs.stat(file).catch(() => null);
  if (!stat) return new Response("Introuvable", { status: 404 });

  const headers = new Headers({
    "Content-Type": thumb ? "image/jpeg" : "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  });
  if (url.searchParams.has("download")) {
    headers.set("Content-Disposition", `attachment; filename="gtaclip-short-${clip.index}.mp4"`);
  }

  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(fileStream(file, start, end), { status: 206, headers });
  }

  headers.set("Content-Length", String(stat.size));
  return new Response(fileStream(file, 0, stat.size - 1), { headers });
}
