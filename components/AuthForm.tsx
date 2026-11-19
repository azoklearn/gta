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
    "mt-1.5 h-12 w-full rounded-[14px] border border-black/10 bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-pink";

  return (
    <div className="mx-auto w-full max-w-md rounded-[28px] border border-black/5 bg-white p-7 shadow-card sm:p-9">
      <h1 className="display text-3xl">{signup ? "Crée ton compte" : "Content de te revoir"}</h1>
      <p className="mt-2 leading-relaxed text-body">
        {signup
          ? `${FREE_TRIAL.shorts} shorts offerts pour essayer, sans carte bancaire.`
          : "Connecte-toi pour retrouver tes shorts et ton offre."}
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <label className="block text-sm font-medium text-ink">
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
        <label className="block text-sm font-medium text-ink">
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

        <p aria-live="polite" className="min-h-5 text-sm font-medium text-[#c2410c]">
          {error}
        </p>

        <button
          type="submit"
          disabled={busy}
          className="group inline-flex h-[3.25rem] w-full items-center justify-between rounded-[14px] bg-ink pl-6 pr-2 text-base font-semibold tracking-tight text-white shadow-button transition hover:bg-black active:scale-[0.98] disabled:opacity-70"
        >
          {busy ? "Un instant…" : signup ? "Créer mon compte" : "Me connecter"}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </form>

      <p className="mt-6 text-center text-[15px] text-body">
        {signup ? "Déjà un compte ? " : "Pas encore de compte ? "}
        <Link href={signup ? "/connexion" : "/inscription"} className="font-semibold text-pink hover:underline">
          {signup ? "Me connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}
