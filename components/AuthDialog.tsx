"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AuthForm } from "./AuthForm";
import { Plus } from "./Icons";

/**
 * Inscription ou connexion dans une fenêtre ouverte par-dessus la page d'accueil, dès qu'un visiteur
 * a donné le lien de sa vidéo : il ne quitte pas la page, et le découpage reprend aussitôt après.
 */
export function AuthDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // La page derrière ne défile pas tant que la fenêtre est ouverte.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  // La fenêtre est rattachée à la page entière : un parent animé ou flouté ne doit pas la contraindre.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signup" ? "Créer un compte" : "Connexion"}
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4 text-left"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/70 backdrop-blur-md"
      />
      <div className="rise-in relative w-full max-w-md">
        <AuthForm
          key={mode}
          mode={mode}
          intro={
            mode === "signup"
              ? "Ta vidéo est prête : crée ton compte pour créer tes shorts."
              : "Connecte-toi pour créer les shorts de ta vidéo."
          }
          onModeChange={setMode}
          onDone={onDone}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 grid size-9 cursor-pointer place-items-center rounded-full border border-white/12 bg-white/[0.04] text-muted transition hover:bg-white/[0.1] hover:text-white"
        >
          <Plus className="size-4 rotate-45" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
