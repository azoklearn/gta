import { config } from "./config";
import { queuedCount } from "./jobs";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 6;

const globalForLimits = globalThis as unknown as { __viceclipHits?: Map<string, number[]> };
const hits = (globalForLimits.__viceclipHits ??= new Map<string, number[]>());

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

/**
 * Vérifie qu'un nouveau découpage peut être accepté : file d'attente non saturée
 * et nombre de lancements par adresse raisonnable. Renvoie une réponse d'erreur, ou `null` si tout va bien.
 */
export function refuseIfBusy(request: Request): Response | null {
  if (queuedCount() >= config.maxQueued) {
    return Response.json(
      { error: "Beaucoup de vidéos sont en cours de découpage. Réessaie dans quelques minutes." },
      { status: 429 },
    );
  }
  const key = clientKey(request);
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return Response.json(
      { error: "Tu as lancé beaucoup de découpages en peu de temps. Réessaie dans une heure." },
      { status: 429 },
    );
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return null;
}
