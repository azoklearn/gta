/** Offres d'abonnement, partagées entre la page des tarifs et le serveur. */

export type PlanId = "clipper" | "expert" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  /** Prix mensuel en euros, toutes taxes comprises. */
  price: number;
  /** Shorts inclus chaque mois ; le compteur repart à ce nombre à chaque prélèvement. */
  shortsPerMonth: number;
  /** Nombre maximal de shorts tirés d'une même vidéo. */
  shortsPerVideo: number;
  /** Durée maximale d'une vidéo source, en minutes. */
  maxMinutes: number;
  /** Rang dans la file d'attente : le plus élevé passe en premier. */
  priority: number;
}

export const PLANS: Plan[] = [
  { id: "clipper", name: "Clipper", price: 19, shortsPerMonth: 30, shortsPerVideo: 3, maxMinutes: 30, priority: 1 },
  { id: "expert", name: "Expert", price: 29, shortsPerMonth: 90, shortsPerVideo: 5, maxMinutes: 60, priority: 2 },
  { id: "pro", name: "Pro", price: 49, shortsPerMonth: 200, shortsPerVideo: 8, maxMinutes: 90, priority: 3 },
];

/** Essai offert à la création du compte, sans carte bancaire. */
export const FREE_TRIAL = { shorts: 3, shortsPerVideo: 3, maxMinutes: 30, priority: 0 };

export function findPlan(id: unknown): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/** État du compte renvoyé par `/api/me`. */
export interface Account {
  email: string;
  /** Offre en cours, ou `null` pendant l'essai et après la fin d'un abonnement. */
  plan: PlanId | null;
  /** Shorts encore disponibles. */
  credits: number;
  /** Fin de la période payée, en millisecondes depuis 1970. */
  periodEnd: number | null;
  /** `active` : renouvellement prévu. `canceled` : l'offre s'arrête à la fin de la période. */
  subscription: "active" | "canceled" | null;
  /** Le dernier prélèvement a échoué ; Mollie réessaie automatiquement. */
  paymentFailed: boolean;
  /** Offre accordée gratuitement, sans abonnement. */
  gifted?: boolean;
  /** Projets récents, du plus récent au plus ancien. */
  projects: { id: string; title: string; createdAt: number }[];
}
