import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config";
import { capture } from "./exec";

type Check = { at: number; problems: { hosting?: string; ffmpeg?: string; ytdlp?: string } };

const RECHECK_MS = 30_000;
const globalForPreflight = globalThis as unknown as { __viceclipPreflight?: Check };

async function available(command: string, flag: string): Promise<boolean> {
  return capture(command, [flag]).then(
    () => true,
    () => false,
  );
}

async function inspect(): Promise<Check["problems"]> {
  const problems: Check["problems"] = {};

  // Le découpage tourne en tâche de fond et écrit sur le disque : impossible sur une plateforme sans serveur permanent.
  const serverless = ["VERCEL", "AWS_LAMBDA_FUNCTION_NAME", "NETLIFY", "CF_PAGES"].find((name) => process.env[name]);
  if (serverless) {
    problems.hosting =
      "Le découpage n'est pas disponible sur cet hébergement. Il lui faut un serveur qui reste allumé, avec ffmpeg et yt-dlp : les hébergements « serverless » comme Vercel ne conviennent pas.";
    return problems;
  }

  try {
    const dir = path.join(config.dataDir, "jobs");
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, `.ecriture-${process.pid}`);
    await fs.writeFile(probe, "");
    await fs.rm(probe, { force: true });
  } catch {
    problems.hosting =
      "Le serveur ne peut pas enregistrer de fichiers dans son dossier de travail. Vérifie le réglage VICECLIP_DATA_DIR et les droits d'écriture.";
    return problems;
  }

  if (!(await available(config.ffmpeg, "-version"))) {
    problems.ffmpeg = "ffmpeg n'est pas installé sur le serveur : le découpage ne peut pas démarrer.";
  }
  if (!(await available(config.ytdlp, "--version"))) {
    problems.ytdlp =
      "yt-dlp n'est pas installé sur le serveur : les liens YouTube ne peuvent pas être récupérés. Importe directement un fichier vidéo.";
  }
  return problems;
}

/**
 * Vérifie que le serveur peut réellement lancer un découpage (disque, ffmpeg, yt-dlp).
 * Renvoie une réponse d'erreur lisible, ou `null` si tout est en place.
 * Le résultat est gardé en mémoire ; un problème est revérifié toutes les 30 secondes.
 */
export async function refuseIfUnavailable(source: "youtube" | "upload"): Promise<Response | null> {
  let check = globalForPreflight.__viceclipPreflight;
  const healthy = check && !Object.keys(check.problems).length;
  if (!check || (!healthy && Date.now() - check.at > RECHECK_MS)) {
    check = { at: Date.now(), problems: await inspect() };
    globalForPreflight.__viceclipPreflight = check;
  }
  const { hosting, ffmpeg, ytdlp } = check.problems;
  const problem = hosting ?? ffmpeg ?? (source === "youtube" ? ytdlp : undefined);
  if (!problem) return null;
  console.error(`[viceclip] découpage refusé : ${problem}`);
  return Response.json({ error: problem }, { status: 503 });
}

/** Réponse renvoyée quand une route échoue de façon imprévue : toujours du JSON, jamais un corps vide. */
export function unexpectedError(err: unknown): Response {
  console.error("[viceclip] erreur inattendue", err);
  return Response.json(
    { error: "Le serveur a rencontré une erreur en lançant le découpage. Réessaie dans un instant." },
    { status: 500 },
  );
}
