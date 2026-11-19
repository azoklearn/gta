"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSignedIn, rememberPlan, startCheckout, useAccount } from "@/lib/account";
import type { Plan } from "@/lib/plans";

/** Bouton d'une offre : ouvre le paiement Mollie, après inscription si le visiteur n'a pas de compte. */
export function PlanButton({ plan, featured }: { plan: Plan; featured: boolean }) {
  const router = useRouter();
  const { account } = useAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = account?.plan === plan.id && account.subscription === "active";

  async function choose() {
    if (busy || current) return;
    setError(null);
    if (!isSignedIn()) {
      rememberPlan(plan.id);
      router.push("/inscription");
      return;
    }
    setBusy(true);
    const failure = await startCheckout(plan.id);
    if (failure) {
      setError(failure);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={choose}
        disabled={busy || current}
        className={`inline-flex h-[3.25rem] w-full items-center justify-center rounded-[14px] text-base font-semibold tracking-tight transition active:scale-[0.98] disabled:opacity-70 ${
          featured
            ? "bg-pink text-white shadow-[0_12px_26px_-12px_rgb(255_46_139/0.9)] hover:brightness-105"
            : "bg-[#f1f0ee] text-ink hover:bg-[#e8e6e3]"
        }`}
      >
        {current ? "Ton offre actuelle" : busy ? "Ouverture du paiement…" : `Passer à ${plan.name}`}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm font-medium text-[#c2410c]">
          {error}
        </p>
      )}
    </div>
  );
}
