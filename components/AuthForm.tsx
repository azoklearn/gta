"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticate, resumeAfterAuth } from "@/lib/account";
import { FREE_TRIAL } from "@/lib/plans";
import { ArrowRight } from "./Icons";

/** Formulaire d'inscription ou de connexion. Après succès, l'utilisateur reprend là où il s'était arrêté. */
export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const failure = await authenticate(mode, email, password);
    if (failure) {
      setError(failure);
      setBusy(false);
      return;
    }
    const next = await resumeAfterAuth();
    if (next.error) window.sessionStorage.setItem("viceclip.message", next.error);
    if (next.goTo) router.push(next.goTo);
  }

  const field =
    "mt-1.5 h-12 w-full rounded-[14px] border border-white/12 bg-white/[0.04] px-4 text-base text-ink outline-none transition placeholder:text-zinc-500 focus:border-white/40";

  return (
    <div className="panel mx-auto w-full max-w-md p-7 sm:p-9">
      <h1 className="display text-[2rem] leading-none">{signup ? "Crée ton compte" : "Content de te revoir"}</h1>
      <p className="mt-2 leading-relaxed text-ink-soft">
        {signup
          ? FREE_TRIAL.shorts > 0
            ? `${FREE_TRIAL.shorts} shorts offerts pour essayer, sans carte bancaire.`
            : "Une minute pour créer ton compte, puis tu choisis ton offre."
          : "Connecte-toi pour retrouver tes shorts et ton offre."}
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <label className="block text-sm font-medium text-ink-soft">
          Adresse e-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Mot de passe
          <input
            type="password"
            required
            minLength={signup ? 8 : undefined}
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={signup ? "8 caractères minimum" : "Ton mot de passe"}
            className={field}
          />
        </label>

        <p aria-live="polite" className="min-h-5 text-sm font-medium text-[#ff9b7a]">
          {error}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="button-shine inline-flex h-[3.25rem] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white text-[16.5px] font-semibold tracking-[-0.005em] text-black transition-[transform,background-color] duration-150 hover:bg-white/90 active:translate-y-px disabled:opacity-70"
        >
          {busy ? "Un instant…" : signup ? "Créer mon compte" : "Me connecter"}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-[15px] text-ink-soft">
        {signup ? "Déjà un compte ? " : "Pas encore de compte ? "}
        <Link href={signup ? "/connexion" : "/inscription"} className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
          {signup ? "Me connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}
