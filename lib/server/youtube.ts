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
 * session présente ou non dans le réglage, et dans le fichier tel que yt-dlp l'a laissé.
 */
async function cookiesReport(): Promise<string> {
  if (config.ytdlpCookies) return "fichier fourni par YTDLP_COOKIES";
  const setting = cookiesText();
  if (!setting) return "aucun cookie";
  const file = await fs.readFile(path.join(config.dbDir, "youtube-cookies.txt"), "utf8").catch(() => "");
  const say = (ok: boolean) => (ok ? "session présente" : "PAS de session");
  return `réglage : ${say(signedIn(setting))} ; après l'appel à YouTube : ${say(signedIn(file))}`;
}

let warned = false;

/**
 * Chemin du fichier de cookies transmis à yt-dlp, ou `null` s'il n'y en a pas.
 *
 * Le contenu de `YTDLP_COOKIES_TEXT` fait foi : il est recopié avant chaque appel. yt-dlp réécrit le
 * fichier qu'on lui donne, et une réponse de YouTube peut en retirer la session ; repartir du réglage
 * évite qu'un seul refus déconnecte le serveur pour de bon.
 */
async function cookies(): Promise<string | null> {
  if (config.ytdlpCookies) return config.ytdlpCookies;
  const text = cookiesText();
  if (!text) {
    if (config.ytdlpCookiesText.trim() && !warned) {
      warned = true;
      console.error("[gtaclip] YTDLP_COOKIES_TEXT n'est pas un fichier de cookies au format Netscape : il est ignoré.");
    }
    return null;
  }
  try {
    const file = path.join(config.dbDir, "youtube-cookies.txt");
    await fs.mkdir(config.dbDir, { recursive: true });
    await fs.writeFile(file, `${text}\n`, { mode: 0o600 });
    return file;
  } catch (err) {
    console.error("[gtaclip] le fichier de cookies YouTube n'a pas pu être préparé", err);
    return null;
  }
}

async function baseArgs(): Promise<string[]> {
  const args = ["--no-playlist", "--no-warnings", "--js-runtimes", "node"];
  const file = await cookies();
  // Avec un compte connecté, les requêtes sont espacées : un compte trop sollicité voit sa session annulée.
  if (file) args.push("--cookies", file, "--sleep-requests", "1");
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
async function withRetries<T>(task: () => Promise<T>, attempts = ATTEMPTS): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (err) {
      const retryable = err instanceof CommandError && /not a bot|Sign in to confirm|HTTP Error 429/i.test(err.stderr);
      // Avec un compte connecté, insister ne sert à rien et expose le compte : une seule tentative.
      if (!retryable || attempt >= (youtubeAccountReady() ? 1 : attempts)) {
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

export async function fetchInfo(url: string, attempts = ATTEMPTS): Promise<VideoInfo> {
  const base = await baseArgs();
  const raw = await withRetries(() => capture(config.ytdlp, [...base, "--skip-download", "--dump-single-json", url]), attempts);
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
 * Récupère seulement les sous-titres d'une vidéo YouTube, pour un fichier que l'utilisateur a envoyé
 * lui-même. Une seule tentative : si YouTube refuse, les shorts sortent simplement sans sous-titres.
 */
export async function downloadSubtitles(url: string, dir: string): Promise<VideoInfo | null> {
  const info = await fetchInfo(url, 1);
  if (!info.subtitleLang) return info;
  const args = [
    ...(await baseArgs()),
    "--skip-download",
    "--write-subs", "--write-auto-subs",
    "--sub-langs", info.subtitleLang,
    "--sub-format", "json3",
    "-o", "source.%(ext)s",
    url,
  ];
  await withRetries(() => run(config.ytdlp, args, { cwd: dir }), 1);
  return info;
}

/** Choix des pistes : H.264 et AAC de préférence, sans dépasser la hauteur d'image demandée. */
function format(height: number): string {
  return `bv*[height<=${height}][vcodec^=avc1]+ba[ext=m4a]/bv*[height<=${height}]+ba/b[height<=${height}]/b`;
}

/** Hauteur de l'aperçu téléchargé pour l'analyse : assez pour repérer les moments forts, très léger. */
const PREVIEW_HEIGHT = 360;

/**
 * Télécharge la vidéo entière et ses sous-titres dans `dir` : en haute qualité, ou en simple aperçu
 * (`preview`) quand seuls les passages retenus seront ensuite récupérés en haute qualité.
 * Renvoie le chemin de la vidéo et, s'ils existent, celui des sous-titres au format json3.
 */
export async function download(
  url: string,
  dir: string,
  subtitleLang: string | null,
  onProgress: (p: number) => void,
  opts: { preview?: boolean; name?: string } = {},
): Promise<{ video: string; subtitles: string | null }> {
  const name = opts.name ?? "source";
  const args = [
    ...(await baseArgs()),
    "-f", format(opts.preview ? PREVIEW_HEIGHT : config.maxHeight),
    "--merge-output-format", "mp4",
    "-o", `${name}.%(ext)s`,
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
  const video = files.find((f) => f.startsWith(`${name}.`) && /\.(mp4|mkv|webm)$/.test(f));
  if (!video) throw new UserError("Le téléchargement s'est terminé sans produire de vidéo.");
  const subtitles = files.find((f) => f.startsWith(`${name}.`) && f.endsWith(".json3"));
  return { video: path.join(dir, video), subtitles: subtitles ? path.join(dir, subtitles) : null };
}

/**
 * Télécharge en haute qualité uniquement les passages retenus, un fichier par passage.
 *
 * yt-dlp ne récupère que la portion demandée de la vidéo. La coupe est faite à l'image près (le passage
 * est réencodé au passage, presque sans perte) : le fichier commence exactement au début du passage,
 * ce qui garde les sous-titres synchronisés.
 */
export async function downloadSections(
  url: string,
  dir: string,
  sections: { index: number; start: number; duration: number }[],
  onProgress: (p: number) => void,
): Promise<Map<number, string>> {
  const args = [
    ...(await baseArgs()),
    "-f", format(config.maxHeight),
    "--merge-output-format", "mp4",
    "--force-keyframes-at-cuts",
    "--downloader-args", "ffmpeg_o:-c:v libx264 -preset ultrafast -crf 14 -pix_fmt yuv420p -c:a aac -b:a 192k",
    "-o", "passage-%(section_start)d.%(ext)s",
    "--newline",
  ];
  // Une seconde de marge en fin de passage, pour que le rendu ne manque jamais d'images.
  for (const section of sections) args.push("--download-sections", `*${section.start}-${section.start + section.duration + 1}`);
  args.push(url);

  await withRetries(() => {
    let started = 0;
    return run(config.ytdlp, args, {
      cwd: dir,
      onStdoutLine(line) {
        if (!line.includes("Destination: passage-")) return;
        started += 1;
        onProgress(Math.min(1, (started - 0.5) / sections.length));
      },
    });
  });

  const files = new Map<number, string>();
  for (const section of sections) {
    const file = path.join(dir, `passage-${Math.floor(section.start)}.mp4`);
    if (!(await fs.stat(file).catch(() => null))) throw new Error(`passage ${section.index} manquant après le téléchargement`);
    files.set(section.index, file);
  }
  onProgress(1);
  return files;
}
