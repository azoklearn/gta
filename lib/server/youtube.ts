import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config";
import { capture, CommandError, run } from "./exec";

export interface VideoInfo {
  id: string;
  title: string;
  channel: string;
  duration: number;
  isLive: boolean;
  /** Piste de sous-titres à récupérer : langue d'origine de la vidéo de préférence. */
  subtitleLang: string | null;
}

/** Une erreur dont le message peut être montré tel quel à l'utilisateur. */
export class UserError extends Error {}

/** YouTube refuse de fournir la vidéo au serveur : l'utilisateur peut alors envoyer le fichier lui-même. */
export class YouTubeBlocked extends UserError {}

/** Le réglage accepte le fichier de cookies tel quel ou encodé en base64. */
function decodeCookies(value: string): string {
  const text = value.trim();
  if (text.includes("\t") || text.startsWith("#")) return text;
  return Buffer.from(text, "base64").toString("utf8").trim();
}

/** Contenu du réglage `YTDLP_COOKIES_TEXT`, ou une chaîne vide s'il n'a pas la forme d'un fichier de cookies. */
function cookiesText(): string {
  if (!config.ytdlpCookiesText.trim()) return "";
  const text = decodeCookies(config.ytdlpCookiesText);
  return text.includes("\t") ? text : "";
}

/** Vrai si le serveur s'identifie auprès de YouTube avec les cookies d'un compte. */
export function youtubeAccountReady(): boolean {
  return Boolean(config.ytdlpCookies || cookiesText());
}

/** Vrai si ce contenu porte une session YouTube ouverte (cookies de connexion présents). */
function signedIn(text: string): boolean {
  return /\tLOGIN_INFO\t/.test(text) && /\t(__Secure-[13]PSID|SID)\t/.test(text);
}

/**
 * Décrit l'état des cookies sans en montrer la valeur, pour comprendre un refus de YouTube :
 * session présente ou non dans le réglage, et dans le fichier que yt-dlp tient à jour.
 */
async function cookiesReport(): Promise<string> {
  if (config.ytdlpCookies) return "fichier fourni par YTDLP_COOKIES";
  const setting = cookiesText();
  if (!setting) return "aucun cookie";
  const file = await fs.readFile(path.join(config.dbDir, "youtube-cookies.txt"), "utf8").catch(() => "");
  const say = (ok: boolean) => (ok ? "session présente" : "PAS de session");
  return `réglage : ${say(signedIn(setting))} ; fichier du serveur : ${say(signedIn(file))}`;
}

let cookiesFile: Promise<string | null> | null = null;

/**
 * Chemin du fichier de cookies transmis à yt-dlp, ou `null` s'il n'y en a pas.
 *
 * Le contenu donné par `YTDLP_COOKIES_TEXT` est écrit sur le disque persistant. yt-dlp met ce fichier
 * à jour quand YouTube renouvelle la session : il n'est donc réécrit que si le réglage a changé, pour
 * ne pas remplacer une session à jour par celle, plus ancienne, du réglage.
 */
function cookies(): Promise<string | null> {
  cookiesFile ??= (async () => {
    if (config.ytdlpCookies) return config.ytdlpCookies;
    const text = cookiesText();
    if (!text) {
      if (config.ytdlpCookiesText.trim()) {
        console.error("[gtaclip] YTDLP_COOKIES_TEXT n'est pas un fichier de cookies au format Netscape : il est ignoré.");
      }
      return null;
    }
    const file = path.join(config.dbDir, "youtube-cookies.txt");
    const mark = `${file}.empreinte`;
    const print = createHash("sha256").update(text).digest("hex");
    const known = await fs.readFile(mark, "utf8").catch(() => "");
    const present = await fs.stat(file).then(
      () => true,
      () => false,
    );
    if (known !== print || !present) {
      await fs.mkdir(config.dbDir, { recursive: true });
      await fs.writeFile(file, `${text}\n`, { mode: 0o600 });
      await fs.writeFile(mark, print, { mode: 0o600 });
    }
    return file;
  })().catch((err) => {
    console.error("[gtaclip] le fichier de cookies YouTube n'a pas pu être préparé", err);
    cookiesFile = null;
    return null;
  });
  return cookiesFile;
}

async function baseArgs(): Promise<string[]> {
  const args = ["--no-playlist", "--no-warnings", "--js-runtimes", "node"];
  const file = await cookies();
  if (file) args.push("--cookies", file);
  if (config.ytdlpProxy) args.push("--proxy", config.ytdlpProxy);
  return args;
}

/** Traduit les erreurs courantes de yt-dlp en messages compréhensibles. */
function explain(err: unknown): Error {
  if (!(err instanceof CommandError)) return err as Error;
  const text = err.stderr;
  if (/introuvable sur le serveur/.test(text)) return new UserError("yt-dlp n'est pas installé sur le serveur.");
  if (/not a bot|Sign in to confirm|HTTP Error 429|This content isn.t available, try again later/i.test(text)) {
    // Le message exact de YouTube dit si le compte est en cause (cookies refusés) ou si c'est une limite de débit.
    const reason = text.split("\n").filter((l) => l.startsWith("ERROR")).pop() ?? text.trim().split("\n").pop() ?? "";
    console.error(`[gtaclip] YouTube refuse la vidéo (compte connecté : ${youtubeAccountReady() ? "oui" : "non"}) : ${reason.slice(0, 400)}`);
    return new YouTubeBlocked(
      "YouTube refuse pour l'instant de fournir ses vidéos à notre serveur (protection anti-robot). Aucun short n'a été décompté de ton offre.",
    );
  }
  if (/Private video|members-only|This video is private/i.test(text)) return new UserError("Cette vidéo est privée ou réservée aux membres.");
  if (/age|confirm your age/i.test(text) && /Sign in/i.test(text)) return new UserError("Cette vidéo est soumise à une limite d'âge et ne peut pas être récupérée.");
  if (/Video unavailable|This video is not available|has been removed|does not exist/i.test(text)) return new UserError("Cette vidéo est introuvable ou indisponible.");
  if (/Unable to download|timed out|Connection|Tunnel|403: Forbidden|getaddrinfo|Name or service/i.test(text)) {
    return new UserError("Le serveur n'a pas pu joindre YouTube. Réessaie dans quelques minutes.");
  }
  const last = text.split("\n").filter((l) => l.startsWith("ERROR")).pop();
  return new UserError(`Le téléchargement a échoué${last ? ` : ${last.replace(/^ERROR:\s*/, "").slice(0, 200)}` : "."}`);
}

const ATTEMPTS = 3;

/**
 * Relance une commande yt-dlp quand YouTube la refuse : la protection anti-robot
 * se déclenche par intermittence, et une nouvelle tentative passe souvent.
 */
async function withRetries<T>(task: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (err) {
      const retryable = err instanceof CommandError && /not a bot|Sign in to confirm|HTTP Error 429/i.test(err.stderr);
      if (!retryable || attempt >= ATTEMPTS) {
        if (retryable) console.error(`[gtaclip] cookies YouTube — ${await cookiesReport()}`);
        throw explain(err);
      }
      await new Promise((resolve) => setTimeout(resolve, 2500 * attempt));
    }
  }
}

type Tracks = Record<string, { ext?: string }[]>;

/** Choisit la piste de sous-titres : sous-titres manuels d'abord, sinon automatiques dans la langue d'origine. */
function pickSubtitles(language: string | undefined, manual: Tracks, automatic: Tracks): string | null {
  const hasJson3 = (tracks: Tracks, lang: string) => tracks[lang]?.some((t) => t.ext === "json3");
  const wanted = [language, "fr", "en"].filter((l): l is string => Boolean(l));
  for (const lang of wanted) if (hasJson3(manual, lang)) return lang;
  for (const lang of wanted) {
    if (hasJson3(automatic, `${lang}-orig`)) return `${lang}-orig`;
  }
  const original = Object.keys(automatic).find((k) => k.endsWith("-orig") && hasJson3(automatic, k));
  if (original) return original;
  for (const lang of wanted) if (hasJson3(automatic, lang)) return lang;
  return null;
}

export async function fetchInfo(url: string): Promise<VideoInfo> {
  const base = await baseArgs();
  const raw = await withRetries(() => capture(config.ytdlp, [...base, "--skip-download", "--dump-single-json", url]));
  const info = JSON.parse(raw) as {
    id: string;
    title?: string;
    channel?: string;
    uploader?: string;
    duration?: number;
    is_live?: boolean;
    live_status?: string;
    language?: string;
    subtitles?: Tracks;
    automatic_captions?: Tracks;
  };
  return {
    id: info.id,
    title: info.title ?? "Vidéo YouTube",
    channel: info.channel ?? info.uploader ?? "",
    duration: info.duration ?? 0,
    isLive: Boolean(info.is_live) || info.live_status === "is_upcoming",
    subtitleLang: pickSubtitles(info.language, info.subtitles ?? {}, info.automatic_captions ?? {}),
  };
}

/**
 * Télécharge la vidéo (1080p au maximum) et ses sous-titres dans `dir`.
 * Renvoie le chemin de la vidéo et, s'ils existent, celui des sous-titres au format json3.
 */
export async function download(
  url: string,
  dir: string,
  subtitleLang: string | null,
  onProgress: (p: number) => void,
): Promise<{ video: string; subtitles: string | null }> {
  const args = [
    ...(await baseArgs()),
    "-f", "bv*[height<=1080][vcodec^=avc1]+ba[ext=m4a]/bv*[height<=1080]+ba/b[height<=1080]/b",
    "--merge-output-format", "mp4",
    "-o", "source.%(ext)s",
    "--newline",
    "--progress-template", "download:PROGRESS %(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.total_bytes_estimate)s",
  ];
  if (subtitleLang) args.push("--write-subs", "--write-auto-subs", "--sub-langs", subtitleLang, "--sub-format", "json3");
  args.push(url);

  // La vidéo puis l'audio sont téléchargés l'un après l'autre : l'avancement repart de zéro entre les deux.
  await withRetries(() => {
    let stream = 0;
    let last = 0;
    return run(config.ytdlp, args, {
      cwd: dir,
      onStdoutLine(line) {
        const m = line.match(/^PROGRESS (\d+) (\d+|NA) (\d+(?:\.\d+)?|NA)/);
        if (!m) return;
        const total = Number(m[2] === "NA" ? m[3] : m[2]);
        if (!Number.isFinite(total) || total <= 0) return;
        const ratio = Math.min(1, Number(m[1]) / total);
        if (ratio < last - 0.5) stream++;
        last = ratio;
        onProgress(stream === 0 ? ratio * 0.9 : 0.9 + ratio * 0.1);
      },
    });
  });

  const files = await fs.readdir(dir);
  const video = files.find((f) => /^source\.(mp4|mkv|webm)$/.test(f));
  if (!video) throw new UserError("Le téléchargement s'est terminé sans produire de vidéo.");
  const subtitles = files.find((f) => /^source\..*\.json3$/.test(f));
  return { video: path.join(dir, video), subtitles: subtitles ? path.join(dir, subtitles) : null };
}
