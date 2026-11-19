const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i;

/** Extrait l'identifiant d'une vidéo YouTube, ou `null` si le lien n'en est pas un. */
export function parseYouTubeId(url: string): string | null {
  return url.trim().match(YOUTUBE_ID)?.[1] ?? null;
}
