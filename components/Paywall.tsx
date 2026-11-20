"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus } from "./Icons";
import { PlanCards } from "./PlanCards";

/**
 * Fenêtre des offres, ouverte quand un compte sans short disponible veut créer des shorts.
 * Choisir une offre mène au paiement ; le lien de la vidéo reste de côté pour la suite.
 */
export function Paywall({ video, onClose }: { video?: string | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Choisir une offre" className="fixed inset-0 z-[60] overflow-y-auto text-left">
      <button type="button" aria-label="Fermer" onClick={onClose} className="fixed inset-0 cursor-default bg-black/80 backdrop-blur-md" />
      <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rise-in relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute -top-2 right-0 grid size-10 cursor-pointer place-items-center rounded-full border border-white/12 bg-white/[0.06] text-ink-soft transition hover:bg-white/[0.12] hover:text-white"
          >
            <Plus className="size-4 rotate-45" />
          </button>
          <div className="mx-auto max-w-2xl pr-10 text-center sm:pr-0">
            <h2 className="display text-[clamp(1.9rem,5vw,3rem)] leading-none text-balance text-white">
              Choisis ton offre pour <span className="text-gradient">créer tes shorts</span>.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-balance text-muted sm:text-[17px]">
              {video ? `Ta vidéo « ${video} » est prête à être découpée.` : "Ta vidéo est prête à être découpée."} Abonnement
              mensuel sans engagement, résiliable en un clic.
            </p>
          </div>
          <PlanCards className="mt-8" />
          <p className="mt-5 text-center text-[13px] text-zinc-500">Paiement sécurisé par Mollie.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
