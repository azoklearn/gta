/** Types partagés entre le serveur et l'interface. */

export type JobStatus = "queued" | "running" | "done" | "error";
export type JobStep = "download" | "analyze" | "render";

export interface ClipScore {
  /** Intensité des premières secondes, de 0 à 100. */
  hook: number;
  /** Activité à l'image sur la durée du short, de 0 à 100. */
  action: number;
  /** Variations d'intensité, de 0 à 100. */
  pace: number;
  /** Note globale, de 0 à 100. */
  total: number;
}

export interface Clip {
  /** Numéro du short, à partir de 1, du mieux noté au moins bien noté. */
  index: number;
  /** Position du début dans la vidéo source, en secondes. */
  start: number;
  /** Durée du short, en secondes. */
  duration: number;
  stars: number;
  score: ClipScore;
  hasSubtitles: boolean;
  /** Légende proposée pour la publication. */
  caption: string;
  hashtags: string[];
}

export interface Job {
  id: string;
  createdAt: number;
  status: JobStatus;
  step: JobStep;
  /** Avancement de l'étape en cours, de 0 à 1. */
  progress: number;
  source: {
    kind: "youtube" | "upload";
    title: string;
    url?: string;
    videoId?: string;
    /** Durée de la vidéo source, en secondes. */
    duration?: number;
  };
  /** Mise en page des shorts : plein écran, ou facecam du streamer en haut et jeu en dessous. */
  layout?: "full" | "facecam";
  /** Compte qui a lancé le découpage. */
  userId?: string;
  /** Shorts réservés sur le quota du compte pour cette vidéo ; ceux qui ne sont pas produits sont rendus. */
  reserved?: number;
  /** Vrai une fois le quota régularisé (shorts non produits rendus au compte). */
  settled?: boolean;
  /** Durée maximale de la vidéo source autorisée par l'offre, en minutes. */
  maxMinutes?: number;
  /** Nombre de shorts déjà rendus pendant l'étape « render ». */
  rendered: number;
  clips: Clip[];
  error?: string;
}
