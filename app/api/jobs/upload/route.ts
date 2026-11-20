import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "@/lib/server/config";
import { api, requireUser } from "@/lib/server/http";
import { jobDir } from "@/lib/server/jobs";
import { launchJob } from "@/lib/server/launch";
import { refuseIfBusy } from "@/lib/server/limits";
import { refuseIfUnavailable } from "@/lib/server/preflight";
import { parseYouTubeId } from "@/lib/youtube";

export { OPTIONS } from "@/lib/server/http";

const EXTENSIONS = new Set(["mp4", "mov", "mkv", "webm", "m4v"]);

/**
 * Reçoit un fichier vidéo envoyé tel quel dans le corps de la requête, puis lance son découpage.
 * Sert de secours quand YouTube refuse de fournir une vidéo ; ouverte avec `VICECLIP_ALLOW_UPLOAD=1`.
 */
export const POST = api(receive);

async function receive(request: Request): Promise<Response> {
  if (!config.allowUpload) {
    return Response.json({ error: "L'import de fichier n'est pas disponible. Colle le lien d'une vidéo YouTube." }, { status: 404 });
  }
  let rawName = request.headers.get("x-filename") ?? "";
  try {
    rawName = decodeURIComponent(rawName);
  } catch {
    // Nom mal encodé : il est utilisé tel quel.
  }
  rawName = rawName.slice(0, 200);
  const ext = rawName.split(".").pop()?.toLowerCase() ?? "";
  if (!EXTENSIONS.has(ext)) {
    return Response.json({ error: "Format non pris en charge. Importe un fichier MP4, MOV, MKV ou WebM." }, { status: 415 });
  }
  const maxMb = Math.round(config.maxUploadBytes / 1024 / 1024);
  const tooLarge = Response.json({ error: `Ce fichier dépasse la taille maximale de ${maxMb} Mo.` }, { status: 413 });
  if (Number(request.headers.get("content-length") ?? 0) > config.maxUploadBytes) return tooLarge;
  if (!request.body) return Response.json({ error: "Aucun fichier reçu." }, { status: 400 });
  const user = requireUser(request);
  // Sans short disponible, l'envoi est refusé tout de suite, avant de recevoir un fichier pour rien.
  if (user.credits <= 0) {
    return Response.json(
      { error: user.plan ? "Tu as utilisé tous les shorts de ton offre ce mois-ci." : "Choisis une offre pour lancer ton découpage." },
      { status: 402 },
    );
  }
  const refusal = (await refuseIfUnavailable("upload")) ?? refuseIfBusy();
  if (refusal) return refusal;

  const id = randomUUID();
  const dir = jobDir(id);
  await fs.mkdir(dir, { recursive: true });

  // Le fichier est écrit sur disque au fil de l'eau, et interrompu s'il dépasse la limite.
  let received = 0;
  const limiter = new Transform({
    transform(chunk: Buffer, _encoding, done) {
      received += chunk.length;
      done(received > config.maxUploadBytes ? new Error("too-large") : null, chunk);
    },
  });
  try {
    await pipeline(
      Readable.fromWeb(request.body as import("node:stream/web").ReadableStream),
      limiter,
      createWriteStream(path.join(dir, `source.${ext}`)),
    );
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true });
    if ((err as Error).message === "too-large") return tooLarge;
    return Response.json({ error: "L'envoi du fichier a été interrompu." }, { status: 400 });
  }
  if (received === 0) {
    await fs.rm(dir, { recursive: true, force: true });
    return Response.json({ error: "Le fichier reçu est vide." }, { status: 400 });
  }

  // Le site indique de quelle vidéo YouTube vient le fichier : son titre et sa chaîne servent aux
  // titres des shorts, et son lien à retrouver les sous-titres.
  const header = (name: string, max: number) => {
    try {
      return decodeURIComponent(request.headers.get(name) ?? "").trim().slice(0, max);
    } catch {
      return "";
    }
  };
  const url = header("x-source-url", 300);
  const videoId = parseYouTubeId(url);
  const title = header("x-title", 200) || rawName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Vidéo importée";
  const source = {
    kind: "upload" as const,
    title,
    channel: header("x-channel", 100) || undefined,
    ...(videoId ? { videoId, url: `https://www.youtube.com/watch?v=${videoId}` } : {}),
  };
  try {
    const job = await launchJob(user, source, id);
    return Response.json({ id: job.id }, { status: 201 });
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true });
    throw err;
  }
}
