import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { config } from "./config";
import { run } from "./exec";
import type { Word } from "./subtitles";

/** Ce que l'IA écrit pour un short : le titre incrusté à l'image, et le texte de la publication. */
export interface ShortCopy {
  title: string;
  caption: string;
  hashtags: string[];
}

interface Passage {
  index: number;
  start: number;
  duration: number;
}

const Answer = z.object({
  shorts: z.array(
    z.object({
      index: z.number(),
      title: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
    }),
  ),
});

const FRAMES_PER_SHORT = 3;
const MAX_TITLE = 78;

const INSTRUCTIONS = `Tu écris les titres de shorts verticaux (TikTok, Reels, YouTube Shorts) découpés dans la vidéo d'un streamer ou d'un youtubeur qui joue à GTA 6.

Pour chaque short, tu reçois des images du passage dans l'ordre chronologique et ce qui est dit pendant ce passage. Le titre est incrusté en haut de l'image pendant tout le short, en capitales, noir sur fond blanc : c'est lui qui donne envie de regarder jusqu'au bout.

Un bon titre :
- raconte ce qui se passe réellement dans ce passage, en une phrase au présent, comme « SQUEEZIE VOLE LE SCOOTER D'UNE MAMIE DANS GTA 6 » ;
- nomme le streamer quand le nom de la chaîne le permet, et dit « GTA 6 » quand cela tient dans la longueur ;
- tient en 60 caractères au plus, sans émoji, sans hashtag, sans guillemets, sans point final ;
- est écrit dans la langue parlée dans la vidéo (à défaut, celle du titre de la vidéo) ;
- reste exact : n'invente ni action, ni personne, ni enjeu que les images et les paroles ne montrent pas. Si le passage est calme, décris-le simplement plutôt que de le survendre.

Chaque short a un titre différent des autres. Les sous-titres automatiques contiennent des erreurs : fie-toi d'abord aux images.

Pour chaque short, écris aussi :
- « caption » : la description de la publication, une ou deux phrases courtes dans la même langue, qui donnent le contexte sans répéter le titre mot pour mot ;
- « hashtags » : cinq hashtags pertinents, en minuscules, dont #gta6.`;

/** Vrai si une clé d'API permet de faire écrire les titres par l'IA. */
export function titlesReady(): boolean {
  return Boolean(config.anthropicApiKey);
}

async function frame(source: string, at: number, output: string): Promise<string | null> {
  try {
    await run(config.ffmpeg, [
      "-v", "error", "-y",
      "-ss", at.toFixed(2),
      "-i", source,
      "-frames:v", "1",
      "-vf", "scale=640:-2",
      "-q:v", "6",
      output,
    ]);
    return (await fs.readFile(output)).toString("base64");
  } catch {
    return null;
  }
}

/** Nettoie un titre pour l'incrustation : capitales, une seule ligne, longueur bornée. */
export function tidyTitle(raw: string): string {
  const text = raw
    .replace(/[{}\\<>\r\n]/g, " ")
    .replace(/^[\s"'«»“”]+|[\s"'«»“”.]+$/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();
  if (text.length <= MAX_TITLE) return text;
  const cut = text.slice(0, MAX_TITLE + 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 20)).trim();
}

function tidyHashtags(raw: string[]): string[] {
  const tags = raw
    .map((tag) => `#${tag.toLowerCase().replace(/[^\p{L}\p{N}_]/gu, "")}`)
    .filter((tag) => tag.length > 2);
  return [...new Set(tags)].slice(0, 6);
}

/**
 * Fait écrire par Claude le titre, la description et les hashtags de chaque short, à partir
 * d'images du passage et de ce qui s'y dit. Une seule requête couvre tous les shorts de la vidéo.
 *
 * Renvoie une table vide si aucune clé n'est configurée ou si la requête échoue : les shorts sont
 * alors rendus sans titre, le découpage ne s'arrête jamais pour cette raison.
 */
export async function writeCopy(
  source: string,
  dir: string,
  video: { title: string; channel?: string },
  passages: Passage[],
  words: Word[],
): Promise<Map<number, ShortCopy>> {
  const copy = new Map<number, ShortCopy>();
  if (!titlesReady() || !passages.length) return copy;

  try {
    const content: Anthropic.Beta.BetaContentBlockParam[] = [
      {
        type: "text",
        text: `Vidéo d'origine : « ${video.title} »${video.channel ? `\nChaîne : ${video.channel}` : ""}\nNombre de shorts : ${passages.length}`,
      },
    ];
    for (const passage of passages) {
      const images = await Promise.all(
        Array.from({ length: FRAMES_PER_SHORT }, (_, i) =>
          frame(
            source,
            passage.start + (passage.duration * (i + 0.5)) / FRAMES_PER_SHORT,
            path.join(dir, `titre-${passage.index}-${i}.jpg`),
          ),
        ),
      );
      const said = words
        .filter((w) => w.start >= passage.start && w.start < passage.start + passage.duration)
        .map((w) => w.text)
        .join(" ");
      content.push({ type: "text", text: `Short ${passage.index}, images du passage :` });
      for (const data of images) {
        if (data) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
      }
      content.push({
        type: "text",
        text: said ? `Short ${passage.index}, paroles : ${said}` : `Short ${passage.index} : personne ne parle dans ce passage.`,
      });
    }

    const client = new Anthropic({ apiKey: config.anthropicApiKey, timeout: 90_000, maxRetries: 2 });
    const response = await client.beta.messages.parse({
      model: config.titleModel,
      max_tokens: 8000,
      // Si le modèle décline une requête, l'API la rejoue sur un modèle de repli.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Answer) },
      system: INSTRUCTIONS,
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      console.error(`[gtaclip] titres : pas de réponse exploitable (${response.stop_reason})`);
      return copy;
    }
    for (const short of response.parsed_output.shorts) {
      const title = tidyTitle(short.title);
      if (!title || !passages.some((p) => p.index === short.index)) continue;
      copy.set(short.index, {
        title,
        caption: short.caption.replace(/\s+/g, " ").trim().slice(0, 300),
        hashtags: tidyHashtags(short.hashtags),
      });
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[gtaclip] titres : la clé ANTHROPIC_API_KEY est refusée par l'API.");
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error("[gtaclip] titres : limite de débit atteinte, shorts rendus sans titre.");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[gtaclip] titres : erreur ${err.status} de l'API`, err.message);
    } else {
      console.error("[gtaclip] titres : échec", err);
    }
  } finally {
    const leftovers = (await fs.readdir(dir).catch(() => [])).filter((f) => f.startsWith("titre-"));
    await Promise.all(leftovers.map((f) => fs.rm(path.join(dir, f), { force: true })));
  }
  return copy;
}
