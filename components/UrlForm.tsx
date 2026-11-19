"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSignedIn, rememberUrl, startJob } from "@/lib/account";
import { parseYouTubeId } from "@/lib/youtube";
import { ArrowRight, LinkIcon } from "./Icons";

export function UrlForm() {
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
    <div className="mx-auto w-full max-w-[38rem]">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex gap-1.5 rounded-[20px] border border-black/5 bg-white p-1.5 shadow-float transition focus-within:border-pink/50"
      >
        <label htmlFor="yt-url" className="sr-only">
          Lien de la vidéo YouTube
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-3 pr-1 sm:px-4">
          <LinkIcon className="hidden h-5 w-5 shrink-0 text-muted sm:block" />
          <input
            id="yt-url"
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
            aria-describedby="yt-url-msg"
            className="h-[3.25rem] w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-muted disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="group inline-flex h-[3.25rem] shrink-0 items-center justify-center gap-3 rounded-[14px] bg-ink pl-4 pr-2 text-base font-semibold tracking-tight text-white shadow-button transition hover:bg-black active:scale-[0.98] disabled:opacity-70 max-[359px]:pr-4 sm:gap-4 sm:pl-6"
        >
          <span>
            {busy ? (
              "Lancement…"
            ) : (
              <>
                Découper<span className="hidden sm:inline"> la vidéo</span>
              </>
            )}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-0.5 max-[359px]:hidden">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </form>

      <div id="yt-url-msg" aria-live="polite">
        {error && (
          <p className="mt-3 text-sm font-medium text-[#c2410c]">
            {error}{" "}
            {needsPlan && (
              <a href="#tarifs" className="font-semibold text-ink underline decoration-pink underline-offset-4">
                Voir les offres
              </a>
            )}
          </p>
        )}
      </div>

      <p className="mt-3 text-[13px] text-muted sm:mt-4 sm:text-sm">3 shorts offerts à l&apos;inscription · Sans carte bancaire</p>
    </div>
  );
}
