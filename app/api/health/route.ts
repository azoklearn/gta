import { serverHealth } from "@/lib/server/preflight";

/** Diagnostic : indique si ce serveur peut lancer des découpages, et sinon pourquoi. */
export async function GET() {
  const health = await serverHealth();
  return Response.json(health, { status: health.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
