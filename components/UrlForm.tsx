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
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-night/70 p-2 shadow-[0_0_60px_-12px_rgb(255_62_165/0.55)] backdrop-blur-md transition focus-within:border-pink/70 sm:flex-row sm:rounded-full"
      >
        <label htmlFor="yt-url" className="sr-only">
          Lien de la vidéo YouTube
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <LinkIcon className="h-5 w-5 shrink-0 text-pink" />
          <input
            id="yt-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://youtube.com/watch?v=…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (state.kind !== "idle") setState({ kind: "idle" });
            }}
            aria-invalid={state.kind === "invalid"}
            aria-describedby="yt-url-msg"
            className="h-12 w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-mist/60"
          />
        </div>
        <button
          type="submit"
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-sunset px-6 text-base font-extrabold text-white transition hover:brightness-110 active:scale-[0.98] sm:rounded-full"
        >
          Découper la vidéo
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </form>

      <div id="yt-url-msg" aria-live="polite">
        {state.kind === "invalid" && (
          <p className="mt-3 text-sm font-semibold text-orange">
            Ce lien ne ressemble pas à une vidéo YouTube. Colle une adresse du type youtube.com/watch?v=… ou
            youtu.be/…
          </p>
        )}

        {state.kind === "ok" && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-panel/90 p-4 text-left backdrop-blur-md sm:p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-cash">
              <Check className="h-4 w-4" /> Vidéo détectée
            </p>
            <div className="mt-3 flex items-stretch gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- vignette distante YouTube */}
              <img
                src={`https://i.ytimg.com/vi/${state.id}/hqdefault.jpg`}
                alt="Vignette de la vidéo"
                className="aspect-video w-2/5 rounded-lg bg-white/5 object-cover"
              />
              <div className="flex flex-1 gap-2">
                {["12%", "50%", "88%"].map((pos) => (
                  // eslint-disable-next-line @next/next/no-img-element -- aperçu de recadrage
                  <img
                    key={pos}
                    src={`https://i.ytimg.com/vi/${state.id}/hqdefault.jpg`}
                    alt=""
                    className="h-full min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 object-cover"
                    style={{ objectPosition: `${pos} center` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-mist">
              Aperçu de trois cadrages 9:16 à partir de la vignette. Le découpage complet (moments forts,
              sous-titres, export) se lance depuis ton compte.
            </p>
            <a
              href="#tarifs"
              className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold text-white underline decoration-pink decoration-2 underline-offset-4 hover:text-pink"
            >
              Choisir une offre et lancer le découpage <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
