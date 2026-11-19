import { config } from "./config";
import { run } from "./exec";
import { FACECAM_HEIGHT, FACECAM_WIDTH, type Region } from "./facecam";

/** Échappe un chemin utilisé comme valeur d'option dans un filtre ffmpeg. */
function filterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/([:'\[\],;])/g, "\\\\$1");
}

/** Recadre au centre au format voulu quel que soit le format d'origine, puis met à l'échelle. */
function cover(width: number, height: number): string {
  return `crop='min(iw,ih*${width}/${height})':'min(ih,iw*${height}/${width})',scale=${width}:${height}:flags=bicubic,setsar=1`;
}

/**
 * Rend un short vertical à partir de la vidéo source.
 *
 * Sans `facecam`, le jeu occupe tout l'écran. Avec, la facecam du streamer remplit le tiers haut
 * et le jeu les deux tiers du bas. `assFile`, s'il est fourni, est incrusté par-dessus l'image.
 */
export async function renderClip(
  source: string,
  output: string,
  opts: { start: number; duration: number; facecam?: Region | null; assFile?: string; onProgress: (p: number) => void },
): Promise<void> {
  const subtitles = opts.assFile
    ? `,subtitles=filename=${filterPath(opts.assFile)}:fontsdir=${filterPath(config.fontsDir)}`
    : "";
  const cam = opts.facecam;
  const graph = cam
    ? [
        `[0:v]split=2[game][cam]`,
        `[cam]crop=${cam.w}:${cam.h}:${cam.x}:${cam.y},scale=${FACECAM_WIDTH}:${FACECAM_HEIGHT}:flags=lanczos,setsar=1[top]`,
        `[game]${cover(1080, 1920 - FACECAM_HEIGHT)}[bottom]`,
        `[top][bottom]vstack=inputs=2${subtitles}[out]`,
      ].join(";")
    : `[0:v]${cover(1080, 1920)}${subtitles}[out]`;

  await run(
    config.ffmpeg,
    [
      "-v", "error",
      "-y",
      "-ss", opts.start.toFixed(3),
      "-t", opts.duration.toFixed(3),
      "-i", source,
      "-filter_complex", graph,
      "-map", "[out]", "-map", "0:a?",
      "-fpsmax", "60",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
      "-movflags", "+faststart",
      "-progress", "pipe:1", "-nostats",
      output,
    ],
    {
      onStdoutLine(line) {
        const m = line.match(/^out_time_us=(\d+)/);
        if (m) opts.onProgress(Math.min(1, Number(m[1]) / 1e6 / opts.duration));
      },
    },
  );
}

/** Extrait une vignette du short rendu. */
export async function renderThumbnail(clip: string, output: string, at: number): Promise<void> {
  await run(config.ffmpeg, ["-v", "error", "-y", "-ss", at.toFixed(2), "-i", clip, "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "4", output]);
}

/** Extrait une image de la vidéo d'origine, pour montrer d'où viennent les shorts. */
export async function renderPoster(source: string, output: string, at: number): Promise<void> {
  await run(config.ffmpeg, ["-v", "error", "-y", "-ss", at.toFixed(2), "-i", source, "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "4", output]);
}
