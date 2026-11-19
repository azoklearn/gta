"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { parseYouTubeId } from "@/lib/youtube";
import { ArrowRight, LinkIcon } from "./Icons";

type Busy = { kind: "link" } | { kind: "upload"; progress: number } | null;

/** Envoie un fichier en suivant l'avancement, ce que `fetch` ne permet pas. */
function uploadFile(file: File, onProgress: (p: number) => void): Promise<{ id?: string; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/jobs/upload");
    xhr.setRequestHeader("x-filename", encodeURIComponent(file.name));
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch {
        resolve({ error: "Le serveur a renvoyé une réponse inattendue." });
      }
    };
    xhr.onerror = () => resolve({ error: "L'envoi du fichier a échoué. Vérifie ta connexion." });
    xhr.send(file);
  });
}

export function UrlForm() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!parseYouTubeId(url)) {
      setError("Ce lien ne ressemble pas à une vidéo YouTube. Essaie une adresse du type youtube.com/watch?v=… ou youtu.be/…");
      return;
    }
    setError(null);
    setBusy({ kind: "link" });
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Le découpage n'a pas pu être lancé.");
      router.push(`/projets/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le découpage n'a pas pu être lancé.");
      setBusy(null);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    setError(null);
    setBusy({ kind: "upload", progress: 0 });
    const data = await uploadFile(file, (progress) => setBusy({ kind: "upload", progress }));
    if (data.id) {
      router.push(`/projets/${data.id}`);
    } else {
      setError(data.error ?? "L'envoi du fichier a échoué.");
      setBusy(null);
    }
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
            disabled={busy !== null}
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
          disabled={busy !== null}
          className="group inline-flex h-[3.25rem] shrink-0 items-center justify-center gap-3 rounded-[14px] bg-ink pl-4 pr-2 text-base font-semibold tracking-tight text-white shadow-button transition hover:bg-black active:scale-[0.98] disabled:opacity-70 max-[359px]:pr-4 sm:gap-4 sm:pl-6"
        >
          <span>
            {busy?.kind === "link" ? (
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
        {error && <p className="mt-3 text-sm font-medium text-[#c2410c]">{error}</p>}
        {busy?.kind === "upload" && (
          <div className="mt-3 rounded-2xl border border-black/5 bg-white px-4 py-3 text-left shadow-card">
            <p className="flex justify-between text-sm font-medium text-ink">
              Envoi de ta vidéo <span className="tabular-nums text-body">{Math.round(busy.progress * 100)} %</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-black/[0.07]">
              <div className="h-full rounded-full bg-pink transition-[width]" style={{ width: `${busy.progress * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[13px] text-muted sm:mt-4 sm:text-sm">
        3 shorts par vidéo · Sans inscription ·{" "}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy !== null}
          className="font-medium text-ink underline decoration-black/25 underline-offset-4 transition hover:decoration-pink disabled:opacity-60"
        >
          ou importe un fichier
        </button>
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,.mp4,.mov,.mkv,.webm,.m4v"
        onChange={onFile}
        className="hidden"
        aria-label="Importer un fichier vidéo"
      />
    </div>
  );
}
