import path from "node:path";
import { config } from "./config";
import { capture } from "./exec";

/** Zone de l'image source, en pixels. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Fractions = { x: number; y: number; w: number; h: number };
type Detection = { found: false } | { found: true; rect: Fractions; face: Fractions; boxed: boolean; presence: number };

/** Format du bandeau réservé à la facecam en haut du short : toute la largeur, un tiers de la hauteur. */
export const FACECAM_WIDTH = 1080;
export const FACECAM_HEIGHT = 640;
const ASPECT = FACECAM_WIDTH / FACECAM_HEIGHT;

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Cherche la facecam du streamer et renvoie la zone à afficher en haut du short, au bon format.
 * Renvoie `null` s'il n'y a pas de facecam, ou si la détection n'est pas disponible sur ce serveur :
 * le short garde alors la mise en page plein écran.
 */
export async function findFacecam(video: string, duration: number, width: number, height: number): Promise<Region | null> {
  let detection: Detection;
  try {
    const script = path.join(process.cwd(), "tools", "facecam.py");
    detection = JSON.parse(await capture(config.python, [script, video, duration.toFixed(2), config.ffmpeg]));
  } catch (err) {
    console.error("[viceclip] détection de la facecam indisponible", err);
    return null;
  }
  if (!detection.found) return null;

  const face = {
    x: detection.face.x * width,
    y: detection.face.y * height,
    w: detection.face.w * width,
    h: detection.face.h * height,
  };
  const faceCenterX = face.x + face.w / 2;
  const faceCenterY = face.y + face.h / 2;

  // Zone dans laquelle on peut cadrer : le cadre de la facecam, ou à défaut (streamer incrusté sans cadre)
  // toute l'image, avec un cadrage serré autour du visage.
  const bounds: Region = detection.boxed
    ? { x: detection.rect.x * width, y: detection.rect.y * height, w: detection.rect.w * width, h: detection.rect.h * height }
    : { x: 0, y: 0, w: width, h: height };
  const wanted = detection.boxed ? bounds.w : Math.min(bounds.w, face.w * 4.2);

  // Recadrage au format du bandeau, le plus large possible dans cette zone.
  const w = Math.min(wanted, bounds.h * ASPECT);
  const h = w / ASPECT;
  // Le visage est centré en largeur et placé un peu au-dessus du milieu en hauteur.
  const x = clamp(faceCenterX - w / 2, bounds.x, bounds.x + bounds.w - w);
  const y = clamp(faceCenterY - h * 0.45, bounds.y, bounds.y + bounds.h - h);

  const region = { x: even(x), y: even(y), w: even(w), h: even(h) };
  region.x = clamp(region.x, 0, even(width) - region.w);
  region.y = clamp(region.y, 0, even(height) - region.h);
  return region.x < 0 || region.y < 0 ? null : region;
}
