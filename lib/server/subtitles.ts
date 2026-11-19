import fs from "node:fs/promises";

export interface Word {
  text: string;
  /** Début et fin du mot dans la vidéo source, en secondes. */
  start: number;
  end: number;
}

interface Json3 {
  events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string; tOffsetMs?: number }[] }[];
}

/**
 * Lit des sous-titres YouTube au format json3.
 * Les sous-titres automatiques donnent l'instant de chaque mot ; pour les sous-titres
 * manuels, les mots d'une ligne sont répartis sur sa durée.
 */
export async function readJson3(file: string): Promise<Word[]> {
  const data = JSON.parse(await fs.readFile(file, "utf8")) as Json3;
  const words: Word[] = [];
  for (const event of data.events ?? []) {
    const start = event.tStartMs ?? 0;
    const duration = event.dDurationMs ?? 0;
    const segs = (event.segs ?? []).filter((s) => s.utf8 && s.utf8.trim());
    if (!segs.length) continue;
    const timed = segs.some((s) => s.tOffsetMs !== undefined) || segs.length === 1;

    const pieces: { text: string; at: number }[] = [];
    if (timed && segs.length > 1) {
      for (const seg of segs) pieces.push({ text: seg.utf8!, at: start + (seg.tOffsetMs ?? 0) });
    } else {
      const tokens = segs.map((s) => s.utf8!).join(" ").split(/\s+/).filter(Boolean);
      tokens.forEach((text, i) => pieces.push({ text, at: start + (duration * i) / tokens.length }));
    }

    for (let i = 0; i < pieces.length; i++) {
      for (const token of pieces[i].text.split(/\s+/)) {
        const text = clean(token);
        if (!text) continue;
        const end = pieces[i + 1]?.at ?? start + duration;
        words.push({ text, start: pieces[i].at / 1000, end: Math.max(pieces[i].at + 120, end) / 1000 });
      }
    }
  }
  words.sort((a, b) => a.start - b.start);
  // Les sous-titres automatiques laissent traîner la fin des lignes : un mot s'arrête au suivant.
  for (let i = 0; i < words.length - 1; i++) {
    words[i].end = Math.min(words[i].end, Math.max(words[i].start + 0.12, words[i + 1].start));
  }
  return words;
}

/** Retire les annotations ([Musique], >>) et les caractères qui ont un sens dans le format ASS. */
function clean(token: string): string {
  if (/^\[.*\]$/.test(token) || /^[\[(].*|.*[\])]$/.test(token)) return "";
  return token.replace(/[{}\\<>\r\n]/g, "").replace(/^>+/, "").trim();
}

function timestamp(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
}

const MAX_WORDS = 3;
const MAX_CHARS = 14;
const MAX_PAUSE = 0.7;
/** Rose de la marque, au format ASS (bleu, vert, rouge). */
const HIGHLIGHT = "&H8B2EFF&";

/** Titre incrusté en haut du short pendant toute sa durée. */
export interface TitleBanner {
  text: string;
  /** Distance entre le haut de l'image et le bandeau, en pixels (image de 1080 × 1920). */
  top: number;
}

const TITLE_LINE = 23;
const TITLE_MAX_LINES = 3;

/** Répartit un titre sur des lignes de longueur voisine, pour un bandeau équilibré. */
export function wrapTitle(text: string): string[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const total = tokens.join(" ").length;
  const count = Math.min(TITLE_MAX_LINES, Math.max(1, Math.ceil(total / TITLE_LINE)));
  const target = total / count;
  const lines: string[] = [];
  let line = "";
  for (const token of tokens) {
    const next = line ? `${line} ${token}` : token;
    const closer = Math.abs(next.length - target) <= Math.abs(line.length - target);
    if (!line || lines.length === count - 1 || (closer && next.length <= TITLE_LINE + 4)) line = next;
    else {
      lines.push(line);
      line = token;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Construit le fichier d'incrustation d'un short : le titre en haut, s'il y en a un, et les
 * sous-titres en courts groupes de mots en capitales, le mot prononcé passant en couleur.
 * Renvoie `null` s'il n'y a ni titre ni paroles dans le passage.
 */
export function buildAss(
  words: Word[],
  clipStart: number,
  clipDuration: number,
  title?: TitleBanner | null,
): { text: string; spoken: boolean } | null {
  const inside = words.filter((w) => w.start >= clipStart && w.start < clipStart + clipDuration);

  const groups: Word[][] = [];
  for (const word of inside.length >= 3 ? inside : []) {
    const group = groups[groups.length - 1];
    const chars = group ? group.reduce((n, w) => n + w.text.length + 1, 0) + word.text.length : 0;
    const pause = group ? word.start - group[group.length - 1].end : 0;
    if (!group || group.length >= MAX_WORDS || chars > MAX_CHARS || pause > MAX_PAUSE) groups.push([word]);
    else group.push(word);
  }

  const lines: string[] = [];
  groups.forEach((group, g) => {
    const nextStart = groups[g + 1]?.[0].start ?? Infinity;
    group.forEach((word, i) => {
      const from = word.start - clipStart;
      const until = i < group.length - 1 ? group[i + 1].start : Math.min(word.end + 0.35, nextStart);
      const to = Math.min(until - clipStart, clipDuration);
      if (to <= from) return;
      const text = group
        .map((w, j) => (j === i ? `{\\c${HIGHLIGHT}}${w.text.toUpperCase()}{\\c&HFFFFFF&}` : w.text.toUpperCase()))
        .join(" ");
      lines.push(`Dialogue: 0,${timestamp(from)},${timestamp(to)},Caption,,0,0,0,,${text}`);
    });
  });
  const spoken = lines.length > 0;
  if (title?.text) {
    const banner = wrapTitle(title.text).join("\\N");
    lines.push(`Dialogue: 1,${timestamp(0)},${timestamp(clipDuration)},Title,,0,0,${Math.round(title.top)},,${banner}`);
  }
  if (!lines.length) return null;

  return {
    spoken,
    text: [
      "[Script Info]",
      "ScriptType: v4.00+",
      "PlayResX: 1080",
      "PlayResY: 1920",
      "WrapStyle: 2",
      "ScaledBorderAndShadow: yes",
      "",
      "[V4+ Styles]",
      "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
      "Style: Caption,Montserrat ExtraBold,108,&H00FFFFFF,&H00FFFFFF,&H00101010,&H80000000,0,0,0,0,100,100,0,0,1,9,4,2,50,50,470,1",
      // Bandeau du titre : texte noir sur un cartouche blanc par ligne, ancré en haut.
      "Style: Title,Montserrat ExtraBold,58,&H00101010,&H00101010,&H00FFFFFF,&H00FFFFFF,0,0,0,0,100,100,0,0,3,14,0,8,60,60,60,1",
      "",
      "[Events]",
      "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
      ...lines,
      "",
    ].join("\n"),
  };
}
