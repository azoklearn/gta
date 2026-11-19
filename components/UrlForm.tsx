"use client";

import { useState } from "react";
import { ArrowRight, Check, LinkIcon } from "./Icons";

const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i;

type State = { kind: "idle" } | { kind: "invalid" } | { kind: "ok"; id: string };

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const match = url.trim().match(YOUTUBE_ID);
    setState(match ? { kind: "ok", id: match[1] } : { kind: "invalid" });
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
            onChange={(e) => {
              setUrl(e.target.value);
              if (state.kind !== "idle") setState({ kind: "idle" });
            }}
            aria-invalid={state.kind === "invalid"}
            aria-describedby="yt-url-msg"
            className="h-[3.25rem] w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="submit"
          className="group inline-flex h-[3.25rem] shrink-0 items-center justify-center gap-3 rounded-[14px] bg-ink pl-4 pr-2 text-base font-semibold tracking-tight text-white shadow-button transition hover:bg-black active:scale-[0.98] max-[359px]:pr-4 sm:gap-4 sm:pl-6"
        >
          <span>
            Découper<span className="hidden sm:inline"> la vidéo</span>
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-0.5 max-[359px]:hidden">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </form>

      <div id="yt-url-msg" aria-live="polite">
        {state.kind === "invalid" && (
          <p className="mt-3 text-sm font-medium text-[#c2410c]">
            Ce lien ne ressemble pas à une vidéo YouTube. Essaie une adresse du type youtube.com/watch?v=… ou
            youtu.be/…
          </p>
        )}

        {state.kind === "ok" && (
          <div className="mt-3 rounded-[20px] border border-black/5 bg-white p-4 text-left shadow-card sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-cash">
              <Check className="h-4 w-4" /> Vidéo détectée
            </p>
            <div className="mt-3 flex items-stretch gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- vignette distante YouTube */}
              <img
                src={`https://i.ytimg.com/vi/${state.id}/hqdefault.jpg`}
                alt="Vignette de la vidéo"
                className="aspect-video w-2/5 rounded-xl bg-paper object-cover"
              />
              <div className="flex flex-1 gap-2">
                {["12%", "50%", "88%"].map((pos) => (
                  // eslint-disable-next-line @next/next/no-img-element -- aperçu de recadrage
                  <img
                    key={pos}
                    src={`https://i.ytimg.com/vi/${state.id}/hqdefault.jpg`}
                    alt=""
                    className="h-full min-w-0 flex-1 rounded-xl bg-paper object-cover"
                    style={{ objectPosition: `${pos} center` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-body">
              Aperçu de trois cadrages 9:16 à partir de la vignette. Le découpage complet (moments forts,
              sous-titres, export) se lance depuis ton compte.
            </p>
            <a
              href="#tarifs"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-pink hover:underline"
            >
              Choisir une offre <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
