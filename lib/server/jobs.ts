import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Job } from "@/lib/types";
import { config } from "./config";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** File d'attente en mémoire, partagée par tout le processus (un traitement à la fois). */
type QueueState = {
  waiting: { id: string; priority: number }[];
  running: string | null;
  worker: ((id: string) => Promise<void>) | null;
};
const globalForQueue = globalThis as unknown as { __viceclipQueue?: QueueState };
const queue: QueueState = (globalForQueue.__viceclipQueue ??= { waiting: [], running: null, worker: null });

export function isJobId(id: string): boolean {
  return ID_PATTERN.test(id);
}

export function jobDir(id: string): string {
  if (!isJobId(id)) throw new Error("Identifiant de traitement invalide");
  return path.join(config.dataDir, "jobs", id);
}

export function clipPath(id: string, index: number, ext: "mp4" | "jpg"): string {
  return path.join(jobDir(id), `short-${index}.${ext}`);
}

/** Image tirée de la vidéo d'origine, gardée pour montrer d'où viennent les shorts. */
export function posterPath(id: string): string {
  return path.join(jobDir(id), "poster.jpg");
}

async function writeJob(job: Job): Promise<void> {
  const file = path.join(jobDir(job.id), "job.json");
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(job));
  await fs.rename(tmp, file);
}

export async function createJob(
  source: Job["source"],
  extra: Pick<Job, "userId" | "reserved" | "maxMinutes"> = {},
  id: string = randomUUID(),
): Promise<Job> {
  const job: Job = {
    ...extra,
    id,
    createdAt: Date.now(),
    status: "queued",
    step: source.kind === "youtube" ? "download" : "analyze",
    progress: 0,
    source,
    rendered: 0,
    clips: [],
  };
  await fs.mkdir(jobDir(id), { recursive: true });
  await writeJob(job);
  return job;
}

export async function readJob(id: string): Promise<Job | null> {
  if (!isJobId(id)) return null;
  let job: Job;
  try {
    job = JSON.parse(await fs.readFile(path.join(jobDir(id), "job.json"), "utf8"));
  } catch {
    return null;
  }
  // Un traitement marqué actif mais inconnu de la file a été interrompu par un redémarrage.
  const active = job.status === "queued" || job.status === "running";
  if (active && queue.running !== id && !isWaiting(id)) {
    job.status = "error";
    job.error = "Le traitement a été interrompu par un redémarrage du serveur. Relance le découpage.";
    await writeJob(job);
    await settleJob(job);
  }
  return job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job> {
  const file = path.join(jobDir(id), "job.json");
  const job: Job = { ...JSON.parse(await fs.readFile(file, "utf8")), ...patch };
  await writeJob(job);
  return job;
}

/**
 * Régularise le quota du compte à la fin d'un découpage : les shorts réservés qui n'ont pas été
 * produits lui sont rendus. Ne s'applique qu'une fois par traitement.
 */
export async function settleJob(job: Job): Promise<void> {
  if (job.settled || !job.userId) return;
  await updateJob(job.id, { settled: true });
  // Un découpage en échec ne livre rien : toute la réservation est rendue.
  const unused = (job.reserved ?? 0) - (job.status === "done" ? job.clips.length : 0);
  if (unused > 0) {
    const { refundShorts } = await import("./auth");
    refundShorts(job.userId, unused);
  }
}

const isWaiting = (id: string) => queue.waiting.some((entry) => entry.id === id);

export function queuedCount(): number {
  return queue.waiting.length + (queue.running ? 1 : 0);
}

/** Position dans la file : 0 si le traitement est en cours, sinon le nombre de traitements avant lui. */
export function queuePosition(id: string): number {
  if (queue.running === id) return 0;
  const i = queue.waiting.findIndex((entry) => entry.id === id);
  return i < 0 ? 0 : i + (queue.running ? 1 : 0);
}

/** Ajoute un traitement à la file. À priorité égale, le premier arrivé passe en premier. */
export function enqueue(id: string, worker: (id: string) => Promise<void>, priority = 0): void {
  queue.worker = worker;
  const after = queue.waiting.findLastIndex((entry) => entry.priority >= priority);
  queue.waiting.splice(after + 1, 0, { id, priority });
  void pump();
}

async function pump(): Promise<void> {
  if (queue.running || !queue.worker) return;
  const id = queue.waiting.shift()?.id;
  if (!id) return;
  queue.running = id;
  try {
    await queue.worker(id);
  } catch (err) {
    console.error(`[viceclip] traitement ${id} en échec`, err);
  } finally {
    queue.running = null;
    void pump();
  }
}

/** Supprime les traitements plus anciens que la durée de conservation. */
export async function removeExpiredJobs(): Promise<void> {
  const root = path.join(config.dataDir, "jobs");
  const limit = Date.now() - config.jobTtlHours * 3600 * 1000;
  let names: string[];
  try {
    names = await fs.readdir(root);
  } catch {
    return;
  }
  for (const name of names) {
    if (!isJobId(name) || queue.running === name || isWaiting(name)) continue;
    const dir = path.join(root, name);
    const stat = await fs.stat(dir).catch(() => null);
    if (stat && stat.mtimeMs < limit) await fs.rm(dir, { recursive: true, force: true });
  }
}
