import type { Job } from "@/lib/types";
import { AccountError, entitlements, rememberJob, reserveShorts } from "./auth";
import type { UserRow } from "./db";
import { createJob, enqueue, removeExpiredJobs } from "./jobs";
import { runJob } from "./pipeline";

/**
 * Réserve les shorts sur le quota du compte, crée le traitement et le place en file d'attente
 * avec la priorité de l'offre.
 */
export async function launchJob(user: UserRow, source: Job["source"], id?: string): Promise<Job> {
  const rights = entitlements(user);
  const reserved = reserveShorts(user.id, rights.shortsPerVideo);
  if (reserved === 0) {
    throw new AccountError(
      user.plan
        ? "Tu as utilisé tous les shorts de ton offre ce mois-ci. Passe à l'offre supérieure pour continuer."
        : "Tes shorts offerts sont épuisés. Choisis une offre pour continuer.",
      402,
    );
  }
  void removeExpiredJobs().catch(() => {});
  const job = await createJob(source, { userId: user.id, reserved, maxMinutes: rights.maxMinutes }, id);
  rememberJob(user.id, job.id, source.title);
  enqueue(job.id, runJob, rights.priority);
  return job;
}
