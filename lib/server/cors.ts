/**
 * Autorise le site à appeler ce serveur depuis un autre domaine (site sur Vercel, découpage ailleurs).
 *
 * `VICECLIP_ALLOWED_ORIGINS` liste les adresses autorisées, séparées par des virgules. Une étoile remplace
 * n'importe quelle suite de caractères : `https://*.vercel.app` couvre les déploiements de prévisualisation.
 */
const patterns = (process.env.VICECLIP_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((entry) => entry.trim().replace(/\/+$/, ""))
  .filter(Boolean)
  .map((entry) => new RegExp(`^${entry.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`));

/** Adresse du site qui appelle, si elle fait partie des sites autorisés. */
export function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  return origin && patterns.some((pattern) => pattern.test(origin)) ? origin : null;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = allowedOrigin(request);
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Filename",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Ajoute les en-têtes d'autorisation à une réponse quand la requête vient d'un site autorisé. */
export function withCors(request: Request, response: Response): Response {
  for (const [name, value] of Object.entries(corsHeaders(request))) response.headers.set(name, value);
  return response;
}

/** Réponse à la requête de vérification que le navigateur envoie avant un appel entre deux domaines. */
export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
