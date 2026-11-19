import { handlePaymentNotification } from "@/lib/server/billing";

/**
 * Notification Mollie : un paiement a changé d'état. Mollie n'envoie que l'identifiant du paiement ;
 * on répond tout de suite, puis on relit l'état réel auprès de Mollie avant de modifier un compte.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const id = form?.get("id");
  if (typeof id === "string" && /^tr_[A-Za-z0-9]{4,40}$/.test(id)) {
    void handlePaymentNotification(id).catch((err) => console.error(`[gtaclip:paiement] notification ${id} en échec`, err));
  }
  return new Response(null, { status: 200 });
}
