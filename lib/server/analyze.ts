import type { ClipScore } from "@/lib/types";
import { config } from "./config";
import { capture, run } from "./exec";

export interface Probe {
  duration: number;
  hasAudio: boolean;
  hasVideo: boolean;
  width: number;
  height: number;
}

export async function probe(file: string): Promise<Probe> {
  const out = await capture(config.ffprobe, [
    "-v", "error",
    "-show_entries", "format=duration:stream=codec_type,width,height",
    "-of", "json",
    file,
  ]);
  const data = JSON.parse(out) as {
    format?: { duration?: string };
    streams?: { codec_type?: string; width?: number; height?: number }[];
  };
  const streams = data.streams ?? [];
  const video = streams.find((s) => s.codec_type === "video");
  return {
    duration: Number(data.format?.duration ?? 0),
    hasAudio: streams.some((s) => s.codec_type === "audio"),
    hasVideo: Boolean(video),
    width: video?.width ?? 0,
    height: video?.height ?? 0,
  };
}

const SAMPLE_RATE = 8000;

/** Niveau sonore moyen de chaque seconde, en décibels (0 dB = pleine échelle). */
export async function audioLevels(file: string, seconds: number, onProgress: (p: number) => void): Promise<number[]> {
  const sums = new Float64Array(seconds + 1);
  let sample = 0;
  let carry: Buffer | null = null;
  await run(config.ffmpeg, ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(SAMPLE_RATE), "-f", "s16le", "-"], {
    onStdout(chunk) {
      const buf = carry ? Buffer.concat([carry, chunk]) : chunk;
      const usable = buf.length - (buf.length % 2);
      for (let i = 0; i < usable; i += 2) {
        const v = buf.readInt16LE(i) / 32768;
        const sec = Math.floor(sample++ / SAMPLE_RATE);
        if (sec <= seconds) sums[sec] += v * v;
      }
      carry = usable < buf.length ? buf.subarray(usable) : null;
      onProgress(Math.min(1, sample / SAMPLE_RATE / Math.max(1, seconds)));
    },
  });
  return Array.from(sums.subarray(0, seconds), (sum) => 10 * Math.log10(sum / SAMPLE_RATE + 1e-8));
}

/**
 * Changement à l'image pour chaque seconde, de 0 à 1.
 * Seules les images clés sont décodées, ce qui garde l'analyse rapide sur de longues vidéos.
 */
export async function sceneActivity(file: string, seconds: number, onProgress: (p: number) => void): Promise<number[]> {
  const marks: { t: number; score: number }[] = [];
  let time = 0;
  await run(
    config.ffmpeg,
    [
      "-v", "error",
      "-skip_frame", "nokey",
      "-i", file,
      "-an",
      "-vf", "scale=160:90,select='gte(scene,0)',metadata=print:file=-",
      "-fps_mode", "passthrough",
      "-f", "null", "-",
    ],
    {
      onStdoutLine(line) {
        const t = line.match(/pts_time:([\d.]+)/);
        if (t) {
          time = Number(t[1]);
          onProgress(Math.min(1, time / Math.max(1, seconds)));
          return;
        }
        const s = line.match(/lavfi\.scene_score=([\d.]+)/);
        if (s) marks.push({ t: time, score: Number(s[1]) });
      },
    },
  );

  // Chaque image clé compare l'image à la précédente : son score vaut pour l'intervalle qui la précède.
  const activity = new Array<number>(seconds).fill(0);
  let prev = 0;
  for (const m of marks) {
    for (let s = Math.floor(prev); s <= Math.min(seconds - 1, Math.floor(m.t)); s++) {
      activity[s] = Math.max(activity[s], m.score);
    }
    prev = m.t;
  }
  return activity;
}

function zScores(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const deviations = values.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const mad = deviations[Math.floor(deviations.length / 2)] || 0;
  const mean = values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, values.length));
  // Écart médian (robuste aux pics), avec l'écart type en secours quand le signal est presque constant.
  const scale = mad * 1.4826 || std || 1;
  return values.map((v) => Math.max(-3, Math.min(3, (v - median) / scale)));
}

function smooth(values: number[], radius: number): number[] {
  return values.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(values.length - 1, i + radius); j++) {
      sum += values[j];
      n++;
    }
    return sum / n;
  });
}

/** Moyenne de `values` sur la fenêtre [start, start + length), via sommes cumulées. */
function windowMeans(values: number[], length: number): number[] {
  const prefix = [0];
  for (const v of values) prefix.push(prefix[prefix.length - 1] + v);
  const out: number[] = [];
  for (let s = 0; s + length <= values.length; s++) out.push((prefix[s + length] - prefix[s]) / length);
  return out;
}

function percentile(value: number, sortedPopulation: number[]): number {
  let lo = 0;
  let hi = sortedPopulation.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedPopulation[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / Math.max(1, sortedPopulation.length)) * 100);
}

export interface Segment {
  start: number;
  duration: number;
  score: ClipScore;
  stars: number;
}

const HOOK_SECONDS = 6;
const GAP_SECONDS = 5;

/**
 * Choisit les meilleurs passages d'une vidéo à partir du son et de l'image.
 *
 * L'intensité de chaque seconde mélange le niveau sonore, les montées soudaines du son
 * (coups de feu, explosions, cris) et les changements à l'image. Les fenêtres les mieux
 * notées sont retenues sans chevauchement, avec un bonus quand le début est fort.
 */
export function pickSegments(levels: number[], activity: number[], count: number, clipSeconds: number): Segment[] {
  const total = Math.min(levels.length, activity.length);
  if (total < 5) return [];
  const length = Math.min(clipSeconds, total);

  const level = zScores(levels.slice(0, total).map((db) => Math.max(-60, db)));
  const onsets = zScores(
    levels.slice(0, total).map((db, i) => {
      const before = levels.slice(Math.max(0, i - 3), i);
      const base = before.length ? before.reduce((a, b) => a + b, 0) / before.length : db;
      return Math.max(0, db - base);
    }),
  );
  const motion = zScores(activity.slice(0, total));
  const intensity = smooth(
    level.map((l, i) => 0.4 * l + 0.25 * onsets[i] + 0.35 * motion[i]),
    1,
  );

  const body = windowMeans(intensity, length);
  const hook = windowMeans(intensity, Math.min(HOOK_SECONDS, length));
  const motionMean = windowMeans(activity.slice(0, total), length);
  const variation = body.map((mean, s) => {
    let sum = 0;
    for (let i = s; i < s + length; i++) sum += (intensity[i] - mean) ** 2;
    return Math.sqrt(sum / length);
  });
  const rank = body.map((b, s) => b + 0.5 * hook[s]);

  // Sélection gloutonne des fenêtres les mieux notées, sans chevauchement.
  const order = rank.map((_, s) => s).sort((a, b) => rank[b] - rank[a]);
  const starts: number[] = [];
  for (const s of order) {
    if (starts.length >= count) break;
    if (starts.every((t) => Math.abs(t - s) >= length + GAP_SECONDS)) starts.push(s);
  }

  const sortedRank = [...rank].sort((a, b) => a - b);
  const rankMean = rank.reduce((a, b) => a + b, 0) / rank.length;
  const rankStd = Math.sqrt(rank.reduce((a, b) => a + (b - rankMean) ** 2, 0) / rank.length) || 1;
  const sortedHook = [...hook].sort((a, b) => a - b);
  const sortedMotion = [...motionMean].sort((a, b) => a - b);
  const sortedVariation = [...variation].sort((a, b) => a - b);

  return starts
    .map((s) => {
      // À quel point le passage se détache du reste de la vidéo (0 : dans la moyenne, 1 : très au-dessus).
      const standout = Math.max(0, Math.min(1, ((rank[s] - rankMean) / rankStd - 0.3) / 2.2));
      const score: ClipScore = {
        hook: percentile(hook[s], sortedHook),
        action: percentile(motionMean[s], sortedMotion),
        pace: percentile(variation[s], sortedVariation),
        total: 0,
      };
      score.total = Math.round(
        45 * standout + 0.2 * score.hook + 0.2 * score.action + 0.15 * score.pace,
      );
      // Une vidéo sans relief ne doit pas produire de « 5 étoiles » : la position relative ne suffit pas.
      score.total = Math.min(score.total, percentile(rank[s], sortedRank));
      const stars = score.total >= 80 ? 5 : score.total >= 62 ? 4 : score.total >= 45 ? 3 : score.total >= 28 ? 2 : 1;
      return { start: s, duration: length, score, stars };
    })
    .sort((a, b) => b.score.total - a.score.total);
}
