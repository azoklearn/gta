import fs from "node:fs/promises";
import path from "node:path";
import type { Clip } from "@/lib/types";
import { audioLevels, pickSegments, probe, sceneActivity } from "./analyze";
import { config } from "./config";
import { FACECAM_HEIGHT, findFacecam } from "./facecam";
import { renameJob } from "./auth";
import { clipPath, jobDir, posterPath, readJob, settleJob, updateJob } from "./jobs";
import { renderClip, renderPoster, renderThumbnail } from "./render";
import { buildAss, readJson3, type Word } from "./subtitles";
import { writeCopy } from "./titles";
import { download, downloadSections, downloadSubtitles, fetchInfo, UserError, YouTubeBlocked } from "./youtube";

const HASHTAGS = ["#gta6", "#gtavi", "#vicecity", "#gaming", "#gtaclips"];

/** Limite les écritures sur disque quand l'avancement change plusieurs fois par seconde. */
function throttled(id: string) {
  let last = 0;
  return (progress: number) => {
    const now = Date.now();
    if (now - last < 400 && progress < 1) return;
    last = now;
    void updateJob(id, { progress }).catch(() => {});
  };
}

/** Supprime les vidéos de travail d'un traitement : seuls les shorts sont conservés. */
async function removeFootage(dir: string): Promise<void> {
  const files = await fs.readdir(dir).catch(() => []);
  const footage = files.filter((f) => /^(source|complet|passage-)/.test(f) && !f.endsWith(".json3"));
  await Promise.all(footage.map((f) => fs.rm(path.join(dir, f), { force: true })));
}

async function findSource(dir: string): Promise<string | null> {
  const name = (await fs.readdir(dir)).find((f) => f.startsWith("source.") && !f.endsWith(".json3"));
  return name ? path.join(dir, name) : null;
}

/** Enchaîne les étapes d'un traitement : récupération, analyse, puis rendu des shorts. */
export async function runJob(id: string): Promise<void> {
  const dir = jobDir(id);
  try {
    let job = await readJob(id);
    if (!job) return;
    const progress = throttled(id);
    // La durée autorisée dépend de l'offre du compte, sans dépasser la limite du serveur.
    const maxMinutes = Math.min(job.maxMinutes ?? config.maxSourceMinutes, config.maxSourceMinutes);
    const tooLong = `Cette vidéo dépasse la durée maximale de ${maxMinutes} minutes prévue par ton offre.`;
    let words: Word[] = [];
    let source: string | null;
    // Téléchargement en deux temps : `source` n'est alors qu'un aperçu en basse qualité, qui sert à l'analyse.
    const sections = job.source.kind === "youtube" && config.downloadSections;

    if (job.source.kind === "youtube") {
      job = await updateJob(id, { status: "running", step: "download", progress: 0 });
      const info = await fetchInfo(job.source.url!);
      if (info.isLive) throw new UserError("Les directs en cours ne sont pas pris en charge. Attends la fin du direct.");
      if (info.duration > maxMinutes * 60) throw new UserError(tooLong);
      job = await updateJob(id, {
        source: { ...job.source, title: info.title, channel: info.channel || undefined, duration: info.duration },
      });
      renameJob(id, info.title);
      source = (await download(job.source.url!, dir, info.subtitleLang, progress, { preview: sections })).video;
    } else {
      source = await findSource(dir);
      // Fichier envoyé par l'utilisateur pour une vidéo YouTube connue : ses sous-titres sont demandés
      // à YouTube. S'il refuse, le découpage continue sans eux.
      if (job.source.url) {
        const info = await downloadSubtitles(job.source.url, dir).catch((err) => {
          console.warn(`[gtaclip] ${id} sous-titres YouTube indisponibles : ${String((err as Error).message).slice(0, 160)}`);
          return null;
        });
        if (info && !job.source.channel && info.channel) {
          job = await updateJob(id, { source: { ...job.source, channel: info.channel } });
        }
      }
    }
    if (!source) throw new UserError("La vidéo source est introuvable.");
    const subtitles = (await fs.readdir(dir)).find((f) => f.endsWith(".json3"));
    if (subtitles) words = await readJson3(path.join(dir, subtitles)).catch(() => []);

    await updateJob(id, { status: "running", step: "analyze", progress: 0 });
    const media = await probe(source).catch(() => null);
    if (!media || !media.hasVideo || media.duration <= 0) {
      throw new UserError("Ce fichier n'est pas une vidéo lisible. Essaie un fichier MP4, MOV ou MKV.");
    }
    if (media.duration > maxMinutes * 60) throw new UserError(tooLong);
    if (media.duration < 20) throw new UserError("Cette vidéo est trop courte pour être découpée (20 secondes minimum).");
    job = await updateJob(id, { source: { ...job.source, duration: Math.round(media.duration) } });

    const seconds = Math.floor(media.duration);
    const levels = media.hasAudio
      ? await audioLevels(source, seconds, (p) => progress(p * 0.45))
      : new Array<number>(seconds).fill(-60);
    const activity = await sceneActivity(source, seconds, (p) => progress(0.45 + p * 0.45));
    const segments = pickSegments(levels, activity, job.reserved ?? config.shortsPerJob, config.clipSeconds);
    if (!segments.length) throw new UserError("Aucun passage exploitable n'a été trouvé dans cette vidéo.");

    const passages = segments.map((segment, i) => ({ index: i + 1, start: segment.start, duration: segment.duration }));

    // Images en haute qualité de chaque passage : dans la vidéo entière si elle est là, sinon dans un
    // fichier par passage, téléchargé maintenant que les passages sont choisis.
    let footage = new Map(passages.map((p) => [p.index, { file: source!, start: p.start }]));
    if (sections) {
      try {
        const files = await downloadSections(job.source.url!, dir, passages, (p) => progress(0.9 + p * 0.1));
        footage = new Map(passages.map((p) => [p.index, { file: files.get(p.index)!, start: 0 }]));
      } catch (err) {
        if (err instanceof YouTubeBlocked) throw err;
        // Le découpage ne doit pas échouer pour cela : la vidéo entière est récupérée, comme avant.
        console.error(`[gtaclip] ${id} passages en haute qualité indisponibles, téléchargement de la vidéo entière`, err);
        const full = (await download(job.source.url!, dir, null, () => {}, { name: "complet" })).video;
        footage = new Map(passages.map((p) => [p.index, { file: full, start: p.start }]));
      }
    }

    // La facecam se cherche sur les images en haute qualité. Un passage peut ne pas la montrer
    // (générique de début) : on essaie alors les suivants.
    let facecam: Awaited<ReturnType<typeof findFacecam>> = null;
    for (const file of [...new Set([...footage.values()].map((shot) => shot.file))].slice(0, 3)) {
      const shape = await probe(file).catch(() => null);
      if (!shape?.hasVideo) continue;
      facecam = await findFacecam(file, shape.duration, shape.width, shape.height);
      if (facecam) break;
    }

    const first = footage.get(1)!;
    await renderPoster(first.file, posterPath(id), first.start + Math.min(2, segments[0].duration / 2)).catch(() => {});
    const copy = await writeCopy(source, dir, job.source, passages, words);

    const clips: Clip[] = segments.map((segment, i) => {
      const written = copy.get(i + 1);
      return {
        index: i + 1,
        start: segment.start,
        duration: segment.duration,
        stars: segment.stars,
        score: segment.score,
        hasSubtitles: false,
        title: written?.title,
        caption:
          written?.caption || (segments.length > 1 ? `${job!.source.title} (partie ${i + 1})` : job!.source.title),
        hashtags: written?.hashtags.length ? written.hashtags : HASHTAGS,
      };
    });
    await updateJob(id, { step: "render", progress: 0, rendered: 0, clips, layout: facecam ? "facecam" : "full" });

    for (const clip of clips) {
      const output = clipPath(id, clip.index, "mp4");
      // Le titre se place juste sous la facecam, ou sous les boutons de l'application en plein écran.
      const banner = clip.title ? { text: clip.title, top: facecam ? FACECAM_HEIGHT + 34 : 250 } : null;
      const ass = buildAss(words, clip.start, clip.duration, banner);
      const assFile = path.join(dir, `short-${clip.index}.ass`);
      if (ass) await fs.writeFile(assFile, ass.text);
      clip.hasSubtitles = Boolean(ass?.spoken);
      const shot = footage.get(clip.index)!;
      await renderClip(shot.file, output, {
        start: shot.start,
        duration: clip.duration,
        facecam,
        assFile: ass ? assFile : undefined,
        onProgress: (p) => progress((clip.index - 1 + p) / clips.length),
      });
      await renderThumbnail(output, clipPath(id, clip.index, "jpg"), Math.min(1.5, clip.duration / 2));
      await updateJob(id, { rendered: clip.index, clips });
    }

    await settleJob(await updateJob(id, { status: "done", progress: 1, clips }));
    await removeFootage(dir);
  } catch (err) {
    const message =
      err instanceof UserError ? err.message : "Le traitement a échoué de façon inattendue. Réessaie avec une autre vidéo.";
    if (!(err instanceof UserError)) console.error(`[gtaclip] ${id}`, err);
    // Les refus sont tracés aussi : ils montrent quand YouTube bloque le serveur.
    else console.warn(`[gtaclip] ${id} refusé : ${message}`);
    await updateJob(id, { status: "error", error: message, youtubeBlocked: err instanceof YouTubeBlocked || undefined })
      .then(settleJob)
      .catch(() => {});
    await removeFootage(dir);
  }
}
