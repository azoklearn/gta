/**
 * Visuels de la landing page, stockés dans `public/images/`.
 * Ce sont des visuels officiels de GTA VI (© Rockstar Games).
 * Pour en changer un, remplace le fichier ou modifie son chemin ici.
 */
export const gameImages = {
  /** Vignette 16:9 de la vidéo YouTube source, dans la maquette du hero. */
  source: "/images/source.jpg",
  /** Les trois shorts générés (portraits, recadrés en 9:16). */
  clips: ["/images/clip-1.jpg", "/images/clip-2.jpg", "/images/clip-3.jpg"],
  /** Capture de jeu en paysage utilisée pour montrer le recadrage 9:16. */
  reframe: "/images/reframe.jpg",
  /** Vue de Vice City au crépuscule, derrière l'appel à l'action final. */
  cta: "/images/city.jpg",
} as const;
