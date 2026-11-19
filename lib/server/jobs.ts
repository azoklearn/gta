import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { Job } from "@/lib/types";
import { config } from "./config";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** File d'attente en mémoire, partagée par tout le processus (un traitement à la fois). */
type QueueState = { waiting: string[]; running: string | null; worker: ((id: string) => Promise<void>) | null };
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

async function writeJob(job: Job): Promise<void> {
  const file = path.join(jobDir(job.id), "job.json");
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(job));
  await fs.rename(tmp, file);
}

export async function createJob(source: Job["source"], id: string = randomUUID()): Promise<Job> {
  const job: Job = {
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
  if (active && queue.running !== id && !queue.waiting.includes(id)) {
    job.status = "error";
    job.error = "Le traitement a été interrompu par un redémarrage du serveur. Relance le découpage.";
    await writeJob(job);
  }
  return job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job> {
  const file = path.join(jobDir(id), "job.json");
  const job: Job = { ...JSON.parse(await fs.readFile(file, "utf8")), ...patch };
  await writeJob(job);
  return job;
}

export function queuedCount(): number {
  return queue.waiting.length + (queue.running ? 1 : 0);
}

/** Position dans la file : 0 si le traitement est en cours, sinon le nombre de traitements avant lui. */
export function queuePosition(id: string): number {
  if (queue.running === id) return 0;
  const i = queue.waiting.indexOf(id);
  return i < 0 ? 0 : i + (queue.running ? 1 : 0);
}

export function enqueue(id: string, worker: (id: string) => Promise<void>): void {
  queue.worker = worker;
  queue.waiting.push(id);
  void pump();
}

async function pump(): Promise<void> {
  if (queue.running || !queue.worker) return;
  const id = queue.waiting.shift();
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
    if (!isJobId(name) || queue.running === name || queue.waiting.includes(name)) continue;
    const dir = path.join(root, name);
    const stat = await fs.stat(dir).catch(() => null);
    if (stat && stat.mtimeMs < limit) await fs.rm(dir, { recursive: true, force: true });
  }
}
