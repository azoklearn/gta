/**
 * Adresse du serveur de découpage.
 *
 * Vide : les routes `/api/jobs` du site lui-même sont utilisées (site et découpage sur le même serveur).
 * Renseignée avec `NEXT_PUBLIC_VICECLIP_API` : le site, hébergé par exemple sur Vercel, s'adresse à un
 * serveur de découpage séparé.
 */
const API_BASE = (process.env.NEXT_PUBLIC_VICECLIP_API ?? "").trim().replace(/\/+$/, "");

/** Construit l'adresse d'une route d'API, par exemple `apiUrl("/api/jobs")`. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
