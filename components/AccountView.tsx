"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { call, refreshAccount, signOut, useAccount } from "@/lib/account";
import { type Account, findPlan, FREE_TRIAL } from "@/lib/plans";
import { ButtonLink } from "./Button";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Après le retour de la page de paiement, le compte est relu jusqu'à ce que Mollie ait confirmé. */
function usePaymentReturn(account: Account | null): "none" | "waiting" | "confirmed" | "unconfirmed" {
  const returning = useSearchParams().get("paiement") === "retour";
  const [timedOut, setTimedOut] = useState(false);
  const active = Boolean(account?.plan && account.subscription === "active");

  useEffect(() => {
    if (!returning || active) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      void refreshAccount();
      if (tries >= 15) {
        clearInterval(timer);
        setTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [returning, active]);

  if (!returning) return "none";
  if (active) return "confirmed";
  return timedOut ? "unconfirmed" : "waiting";
}

function Banner({ tone, children }: { tone: "info" | "good" | "warn"; children: React.ReactNode }) {
  const tones = {
    info: "border-black/10 bg-white text-ink",
    good: "border-cash/30 bg-cash/10 text-ink",
    warn: "border-orange/40 bg-orange/10 text-ink",
  };
  return <p className={`rounded-2xl border px-5 py-4 text-[15px] leading-relaxed ${tones[tone]}`}>{children}</p>;
}

export function AccountView() {
  const router = useRouter();
  const { status, account } = useAccount();
  const payment = usePaymentReturn(account);
  const [notice] = useState(() => {
    if (typeof window === "undefined") return null;
    const message = window.sessionStorage.getItem("viceclip.message");
    window.sessionStorage.removeItem("viceclip.message");
    return message;
  });
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "guest") router.replace("/connexion");
  }, [status, router]);

  if (status !== "ready" || !account) {
    return <p className="text-center text-body">Chargement de ton compte…</p>;
  }

  const plan = findPlan(account.plan);
  const until = account.periodEnd ? dateFormat.format(new Date(account.periodEnd)) : null;

  async function cancel() {
    setBusy(true);
    setError(null);
    const reply = await call("/api/billing/cancel", {});
    if (!reply.ok) setError(reply.data.error ?? "La résiliation n'a pas abouti.");
    await refreshAccount();
    setBusy(false);
    setConfirming(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="display text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">Mon compte</h1>
        <p className="mt-2 text-body">{account.email}</p>
      </div>

      {payment === "waiting" && <Banner tone="info">Paiement en cours de confirmation par Mollie, un instant…</Banner>}
      {payment === "confirmed" && plan && (
        <Banner tone="good">
          Paiement confirmé : ton offre {plan.name} est active, avec {plan.shortsPerMonth} shorts ce mois-ci.
        </Banner>
      )}
      {payment === "unconfirmed" && (
        <Banner tone="warn">
          Le paiement n&apos;a pas été confirmé. S&apos;il a été annulé ou refusé, tu peux réessayer depuis les tarifs. S&apos;il
          vient d&apos;être effectué, recharge cette page dans une minute.
        </Banner>
      )}
      {notice && <Banner tone="warn">{notice}</Banner>}
      {account.paymentFailed && (
        <Banner tone="warn">
          Ton dernier prélèvement a échoué. Mollie va réessayer automatiquement ; vérifie ton moyen de paiement pour ne pas
          perdre ton offre.
        </Banner>
      )}

      <section className="rounded-[28px] border border-black/5 bg-white p-7 shadow-card sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Offre</p>
            <p className="display mt-1 text-3xl">{plan ? plan.name : "Essai gratuit"}</p>
            <p className="mt-2 text-[15px] text-body">
              {plan
                ? account.subscription === "canceled"
                  ? `Résiliée : elle reste active jusqu'au ${until}, puis s'arrête sans nouveau prélèvement.`
                  : `${plan.price} € par mois, prochain prélèvement le ${until}.`
                : `${FREE_TRIAL.shorts} shorts offerts pour essayer, sans carte bancaire.`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Shorts restants</p>
            <p className="display mt-1 text-5xl tabular-nums text-pink">{account.credits}</p>
            {plan && <p className="mt-1 text-[13px] text-muted">sur {plan.shortsPerMonth} ce mois-ci</p>}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/[0.07] pt-6">
          <ButtonLink href="/#top">Découper une vidéo</ButtonLink>
          <Link
            href="/#tarifs"
            className="inline-flex h-[3.25rem] items-center rounded-[14px] border border-black/10 px-6 text-base font-semibold text-ink transition hover:bg-paper"
          >
            {plan ? "Changer d'offre" : "Voir les offres"}
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-7 shadow-card sm:p-9">
        <h2 className="display text-2xl">Mes projets récents</h2>
        {account.projects.length === 0 ? (
          <p className="mt-3 text-body">Aucun découpage pour l&apos;instant. Colle le lien d&apos;une vidéo pour commencer.</p>
        ) : (
          <ul className="mt-4 divide-y divide-black/[0.07]">
            {account.projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projets/${project.id}`} className="flex items-center justify-between gap-4 py-3.5 transition hover:text-pink">
                  <span className="min-w-0 truncate font-medium">{project.title}</span>
                  <span className="shrink-0 text-[13px] text-muted">{dateFormat.format(new Date(project.createdAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[13px] text-muted">Les shorts restent disponibles 24 heures après le découpage.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 px-2">
        <button
          type="button"
          onClick={() => void signOut().then(() => router.push("/"))}
          className="text-[15px] font-semibold text-ink underline decoration-black/25 underline-offset-4 hover:decoration-pink"
        >
          Me déconnecter
        </button>

        {plan && account.subscription === "active" && (
          <div className="text-right">
            {confirming ? (
              <p className="flex flex-wrap items-center justify-end gap-3 text-[15px] text-body">
                Résilier l&apos;offre {plan.name} ? Elle restera active jusqu&apos;au {until}.
                <button type="button" disabled={busy} onClick={cancel} className="font-semibold text-[#c2410c] hover:underline disabled:opacity-60">
                  {busy ? "Résiliation…" : "Oui, résilier"}
                </button>
                <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="font-semibold text-ink hover:underline">
                  Annuler
                </button>
              </p>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="text-[15px] text-muted underline underline-offset-4 hover:text-ink">
                Résilier mon abonnement
              </button>
            )}
            {error && <p className="mt-2 text-sm font-medium text-[#c2410c]">{error}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
