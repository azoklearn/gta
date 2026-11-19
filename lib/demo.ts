/**
 * Visuels de la page d'accueil, stockés dans `public/demo/`.
 * Ce sont des images de vraies vidéos YouTube de streamers et des shorts que GTAClip en a tirés.
 * Pour en changer un, remplace le fichier ou modifie son chemin ici.
 */

export interface DemoShort {
  /** Image du short généré (9:16). */
  image: string;
  /** Titre incrusté sur le short. */
  title: string;
  /** Chaîne d'où vient le passage. */
  channel: string;
  /** Score du short, sur 100. */
  score: number;
  /** Durée du short, en secondes. */
  seconds: number;
}

export const demo = {
  /** La vidéo d'origine montrée en haut de page, et les shorts qui en ont été tirés. */
  source: {
    image: "/demo/source-1.jpg",
    title: "GTA 6 est le MEILLEUR JEU ! (Découverte Avant-Première) #0",
    channel: "Jinskow",
    minutes: 16,
  },
  /** Extrait d'un short généré, lu en boucle en haut de page. */
  video: "/demo/short.mp4",
  shorts: [
    {
      image: "/demo/short-1.jpg",
      title: "",
      channel: "Jinskow",
      score: 89,
      seconds: 64,
    },
    {
      image: "/demo/short-2.jpg",
      title: "",
      channel: "Jinskow",
      score: 82,
      seconds: 64,
    },
    {
      image: "/demo/short-3.jpg",
      title: "",
      channel: "Jinskow",
      score: 67,
      seconds: 64,
    }
  ] as DemoShort[],
  /** Le short le mieux noté de plusieurs vidéos, pour la section « Ce que fait l'IA ». */
  picks: [
    {
      image: "/demo/wall-110.jpg",
      title: "",
      channel: "Jinskow",
      score: 89,
      seconds: 64,
    },
    {
      image: "/demo/wall-210.jpg",
      title: "",
      channel: "Kevko",
      score: 96,
      seconds: 64,
    }
  ] as DemoShort[],
  /** Images de shorts générés, pour le bandeau défilant. */
  wall: [
    "/demo/wall-110.jpg",
    "/demo/wall-120.jpg",
    "/demo/wall-130.jpg",
    "/demo/wall-210.jpg",
    "/demo/wall-220.jpg",
    "/demo/wall-230.jpg",
    "/demo/wall-231.jpg",
    "/demo/wall-221.jpg",
    "/demo/wall-211.jpg",
    "/demo/wall-131.jpg",
    "/demo/wall-121.jpg",
    "/demo/wall-111.jpg",
  ],
  /** Images des vidéos d'origine. */
  sources: [
    "/demo/source-1.jpg",
    "/demo/source-2.jpg",
  ],
};
