/**
 * Emplacements d'images de la landing page.
 *
 * Les fichiers sont dans `public/images/` (visuels officiels de GTA VI,
 * © Rockstar Games). Pour en changer un, remplace le fichier ou son chemin.
 * Une entrée à `null` affiche une illustration vectorielle « Vice City ».
 */
export const gameImages: {
  /** Grand visuel d'ambiance derrière le titre (paysage, 1920 px de large mini). */
  hero: string | null;
  /** Vignette de la « vidéo YouTube source » (16:9). */
  source: string | null;
  /** Les trois shorts générés (idéalement des images qui se recadrent bien en 9:16). */
  clips: [string | null, string | null, string | null];
  /** Visuel du bandeau d'appel à l'action en bas de page (paysage). */
  cta: string | null;
} = {
  hero: "/images/hero.jpg",
  source: "/images/source.jpg",
  clips: ["/images/clip-1.jpg", "/images/clip-2.jpg", "/images/clip-3.jpg"],
  cta: "/images/cta.jpg",
};
