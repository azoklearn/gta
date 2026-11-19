import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "@/lib/server/config";
import { createJob, enqueue, jobDir, removeExpiredJobs } from "@/lib/server/jobs";
import { refuseIfBusy } from "@/lib/server/limits";
import { runJob } from "@/lib/server/pipeline";
import { refuseIfUnavailable, unexpectedError } from "@/lib/server/preflight";

const EXTENSIONS = new Set(["mp4", "mov", "mkv", "webm", "m4v"]);

/** Reçoit un fichier vidéo envoyé tel quel dans le corps de la requête, puis lance son découpage. */
export async function POST(request: Request) {
  try {
    return await receive(request);
  } catch (err) {
    return unexpectedError(err);
  }
}

async function receive(request: Request): Promise<Response> {
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
  const refusal = (await refuseIfUnavailable("upload")) ?? refuseIfBusy(request);
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

  void removeExpiredJobs().catch(() => {});
  const title = rawName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Vidéo importée";
  const job = await createJob({ kind: "upload", title }, id);
  enqueue(job.id, runJob);
  return Response.json({ id: job.id }, { status: 201 });
}
