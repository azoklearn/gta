"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSignedIn, rememberUrl, startJob } from "@/lib/account";
import { parseYouTubeId } from "@/lib/youtube";
import { ArrowRight, LinkIcon } from "./Icons";

export function UrlForm({ id = "yt-url" }: { id?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsPlan, setNeedsPlan] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!parseYouTubeId(url)) {
      setError("Ce lien ne ressemble pas à une vidéo YouTube. Essaie une adresse du type youtube.com/watch?v=… ou youtu.be/…");
      return;
    }
    setError(null);
    // Le découpage est rattaché à un compte : un visiteur crée d'abord le sien, puis reprend ici.
    if (!isSignedIn()) {
      rememberUrl(url);
      router.push("/inscription");
      return;
    }
    setBusy(true);
    const job = await startJob(url);
    if (job.id) {
      router.push(`/projets/${job.id}`);
      return;
    }
    setError(job.error ?? "Le découpage n'a pas pu être lancé.");
    setNeedsPlan(job.status === 402);
    setBusy(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-[37rem] flex-col items-center gap-3">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex w-full items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors focus-within:border-white/35"
      >
        <label htmlFor={id} className="sr-only">
          Lien de la vidéo YouTube
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-1 pl-4 sm:pl-5">
          <LinkIcon className="hidden size-5 shrink-0 text-muted sm:block" />
          <input
            id={id}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="Colle un lien YouTube"
            value={url}
            disabled={busy}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            aria-invalid={error !== null}
            aria-describedby={`${id}-msg`}
            className="h-12 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-zinc-500 disabled:opacity-60 sm:h-[3.25rem] sm:text-[17px]"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="button-shine inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold tracking-[-0.005em] whitespace-nowrap text-black transition-[transform,background-color] duration-150 hover:bg-white/90 focus-visible:ring-4 focus-visible:ring-white/30 active:translate-y-px disabled:opacity-70 sm:h-[3.25rem] sm:px-7 sm:text-[17px]"
        >
          {busy ? "Lancement…" : "Découper"}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <div id={`${id}-msg`} aria-live="polite" className="empty:hidden">
        {error && (
          <p className="text-center text-sm font-medium text-[#ff9b7a]">
            {error}{" "}
            {needsPlan && (
              <a href="#tarifs" className="font-semibold text-white underline decoration-white/40 underline-offset-4">
                Voir les offres
              </a>
            )}
          </p>
        )}
      </div>

      <p className="text-[13px] text-zinc-500 sm:text-sm">3 shorts offerts à l&apos;inscription · Sans carte bancaire</p>
    </div>
  );
}
