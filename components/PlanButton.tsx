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
        className={`inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[15.5px] font-semibold tracking-[-0.005em] transition-[transform,background-color] duration-150 active:translate-y-px disabled:cursor-default disabled:opacity-70 ${
          featured ? "button-shine bg-white text-black hover:bg-white/90" : "border border-white/12 bg-white/[0.05] text-ink hover:bg-white/[0.1]"
        }`}
      >
        {current ? "Ton offre actuelle" : busy ? "Ouverture du paiement…" : `Passer à ${plan.name}`}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm font-medium text-[#ff9b7a]">
          {error}
        </p>
      )}
    </div>
  );
}
