import { AccountError, currentUser } from "./auth";
import { preflight, withCors } from "./cors";
import type { UserRow } from "./db";

/**
 * Enveloppe une route d'API : autorisations entre sites, erreurs de saisie renvoyées en JSON,
 * et jamais de réponse vide en cas d'erreur imprévue.
 */
export function api(handler: (request: Request) => Promise<Response> | Response) {
  return async (request: Request): Promise<Response> => {
    try {
      return withCors(request, await handler(request));
    } catch (err) {
      if (err instanceof AccountError) return withCors(request, Response.json({ error: err.message }, { status: err.status }));
      console.error("[gtaclip] erreur inattendue", err);
      return withCors(
        request,
        Response.json({ error: "Le serveur a rencontré une erreur. Réessaie dans un instant." }, { status: 500 }),
      );
    }
  };
}

export const OPTIONS = (request: Request) => preflight(request);

/** Utilisateur connecté, ou erreur 401. */
export function requireUser(request: Request): UserRow {
  const user = currentUser(request);
  if (!user) throw new AccountError("Connecte-toi pour continuer.", 401);
  return user;
}

export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}
