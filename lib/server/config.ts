import path from "node:path";

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Réglages du serveur. Chaque valeur peut être surchargée par une variable d'environnement. */
export const config = {
  /** Dossier où sont stockés les traitements (vidéos sources temporaires et shorts). */
  dataDir: process.env.VICECLIP_DATA_DIR || path.join(process.cwd(), "data"),
  /** Dossier de la base de données des comptes. À placer sur un disque persistant. */
  dbDir: process.env.VICECLIP_DB_DIR || process.env.VICECLIP_DATA_DIR || path.join(process.cwd(), "data"),
  fontsDir: path.join(process.cwd(), "assets", "fonts"),
  /** Clé d'API Mollie (`test_…` ou `live_…`). Sans elle, les abonnements sont désactivés. */
  mollieApiKey: process.env.MOLLIE_API_KEY || "",
  /** Adresse de l'API Mollie, à changer uniquement pour des essais. */
  mollieApiUrl: process.env.MOLLIE_API_URL || "",
  /** Adresse publique de ce serveur, que Mollie appelle pour notifier les paiements. */
  publicUrl: (
    process.env.VICECLIP_PUBLIC_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "")
  ).replace(/\/+$/, ""),
  /** Durée maximale d'une vidéo source, en minutes. */
  maxSourceMinutes: num(process.env.VICECLIP_MAX_MINUTES, 90),
  /**
   * Import direct d'un fichier vidéo par `POST /api/jobs/upload`. Le site ne le propose pas : cette route
   * sert aux essais et reste fermée tant que `VICECLIP_ALLOW_UPLOAD=1` n'est pas réglé.
   */
  allowUpload: process.env.VICECLIP_ALLOW_UPLOAD === "1",
  /** Taille maximale d'un fichier importé, en octets. */
  maxUploadBytes: num(process.env.VICECLIP_MAX_UPLOAD_MB, 2048) * 1024 * 1024,
  /** Nombre de shorts produits par vidéo. */
  shortsPerJob: Math.round(num(process.env.VICECLIP_SHORTS_PER_JOB, 3)),
  /** Durée visée pour chaque short, en secondes (au-dessus d'une minute pour la rémunération TikTok). */
  clipSeconds: Math.max(15, Math.round(num(process.env.VICECLIP_CLIP_SECONDS, 64))),
  /** Nombre maximal de traitements en file d'attente. */
  maxQueued: 8,
  /** Durée de conservation des shorts, en heures. */
  jobTtlHours: num(process.env.VICECLIP_JOB_TTL_HOURS, 24),
  ffmpeg: process.env.FFMPEG_PATH || "ffmpeg",
  ffprobe: process.env.FFPROBE_PATH || "ffprobe",
  ytdlp: process.env.YTDLP_PATH || "yt-dlp",
  /** Python sert à la détection de la facecam (avec OpenCV). */
  python: process.env.PYTHON_PATH || "python3",
  /** Fichier de cookies et proxy facultatifs pour yt-dlp, utiles si YouTube bloque l'adresse du serveur. */
  ytdlpCookies: process.env.YTDLP_COOKIES || "",
  ytdlpProxy: process.env.YTDLP_PROXY || "",
};
