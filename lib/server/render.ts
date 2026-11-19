import { config } from "./config";
import { run } from "./exec";

/** Échappe un chemin utilisé comme valeur d'option dans un filtre ffmpeg. */
function filterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/([:'\[\],;])/g, "\\\\$1");
}

/** Recadre au centre en 9:16 quel que soit le format d'origine, puis met à l'échelle en 1080 × 1920. */
const VERTICAL = "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=bicubic,setsar=1";

/**
 * Rend un short vertical à partir de la vidéo source.
 * `assFile`, s'il est fourni, est incrusté par-dessus l'image.
 */
export async function renderClip(
  source: string,
  output: string,
  opts: { start: number; duration: number; assFile?: string; onProgress: (p: number) => void },
): Promise<void> {
  const filters = [VERTICAL];
  if (opts.assFile) filters.push(`subtitles=filename=${filterPath(opts.assFile)}:fontsdir=${filterPath(config.fontsDir)}`);

  await run(
    config.ffmpeg,
    [
      "-v", "error",
      "-y",
      "-ss", opts.start.toFixed(3),
      "-t", opts.duration.toFixed(3),
      "-i", source,
      "-vf", filters.join(","),
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
