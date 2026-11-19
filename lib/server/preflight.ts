import fs from "node:fs/promises";
import path from "node:path";
import { billingReady } from "./billing";
import { config } from "./config";
import { capture } from "./exec";
import { titlesReady } from "./titles";

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
      "Le découpage n'est pas encore branché sur ce site : il lui faut un serveur de découpage séparé, dont l'adresse se règle avec NEXT_PUBLIC_VICECLIP_API (voir le README).";
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
      "yt-dlp n'est pas installé sur le serveur : les liens YouTube ne peuvent pas être récupérés.";
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

/** État du serveur pour la route de diagnostic `/api/health`. */
export async function serverHealth(): Promise<{
  ok: boolean;
  youtube: boolean;
  facecam: boolean;
  billing: boolean;
  titles: boolean;
  problems: string[];
}> {
  const problems = await inspect();
  return {
    ok: !problems.hosting && !problems.ffmpeg,
    youtube: !problems.hosting && !problems.ffmpeg && !problems.ytdlp,
    // La mise en page « facecam en haut » demande Python et OpenCV ; sans eux les shorts restent en plein écran.
    facecam: await capture(config.python, ["-c", "import cv2, numpy; cv2.CascadeClassifier"]).then(
      () => true,
      () => false,
    ),
    // Les abonnements demandent une clé Mollie et une adresse publique pour les notifications.
    billing: billingReady(),
    // Les titres incrustés sont écrits par l'IA : sans clé d'API, les shorts sortent sans titre.
    titles: titlesReady(),
    problems: Object.values(problems),
  };
}
