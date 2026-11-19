/**
 * Emplacements d'images de la landing page.
 *
 * Tant qu'une entrée vaut `null`, une illustration vectorielle « Vice City »
 * est affichée à la place. Pour utiliser un visuel du jeu, dépose le fichier
 * dans `public/images/` puis renseigne son chemin ici, par exemple :
 *
 *   hero: "/images/hero.jpg",
 */
export const gameImages: {
  /** Grand visuel d'ambiance derrière le titre (paysage, 1920 px de large mini). */
  hero: string | null;
  /** Vignette de la « vidéo YouTube source » (16:9). */
  source: string | null;
  /** Les trois shorts générés (idéalement des images qui se recadrent bien en 9:16). */
  clips: [string | null, string | null, string | null];
} = {
  hero: null,
  source: null,
  clips: [null, null, null],
};
