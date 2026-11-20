"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSignedIn, lookupVideo, refreshAccount, rememberUrl, type VideoPreview } from "@/lib/account";
import { parseYouTubeId } from "@/lib/youtube";
import { AuthDialog } from "./AuthDialog";
import { ArrowRight, Check, LinkIcon, Play } from "./Icons";
import { Paywall } from "./Paywall";

/**
 * Barre de lien de la page d'accueil. Dès que le lien est celui d'une vidéo YouTube, la vidéo est
 * reconnue et montrée avec le bouton « Créer mes shorts ». Ce bouton mène, selon le compte, à la
 * connexion, aux offres, ou à l'envoi de la vidéo.
 */
export function UrlForm({ id = "yt-url" }: { id?: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<VideoPreview | null>(null);
  const [step, setStep] = useState<"form" | "auth" | "offers">("form");

  const videoId = parseYouTubeId(url);
  // La miniature se déduit du lien ; le titre et la chaîne arrivent juste après.
  const video: VideoPreview | null = videoId
    ? details?.id === videoId
      ? details
      : { id: videoId, title: null, channel: null, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }
    : null;

  useEffect(() => {
    if (!videoId) return;
    let stale = false;
    void lookupVideo(`https://www.youtube.com/watch?v=${videoId}`).then((found) => {
      if (!stale && found) setDetails(found);
    });
    return () => {
      stale = true;
    };
  }, [videoId]);

  /** Avec des shorts disponibles, on passe à l'envoi de la vidéo ; sinon, aux offres. */
  async function proceed() {
    setBusy(true);
    const account = await refreshAccount();
    setBusy(false);
    if ((account?.credits ?? 0) > 0) router.push("/importer");
    else setStep("offers");
  }

  async function create() {
    if (busy) return;
    if (!videoId) {
      setError("Ce lien ne ressemble pas à une vidéo YouTube. Essaie une adresse du type youtube.com/watch?v=… ou youtu.be/…");
      return;
    }
    setError(null);
    // Le lien est gardé de côté : il est repris après la connexion et le paiement.
    rememberUrl(`https://www.youtube.com/watch?v=${videoId}`);
    if (!isSignedIn()) {
      setStep("auth");
      return;
    }
    await proceed();
  }

  return (
    <div className="mx-auto flex w-full max-w-[37rem] flex-col items-center gap-3">
      {step === "auth" && (
        <AuthDialog
          onClose={() => setStep("form")}
          onDone={() => {
            setStep("form");
            void proceed();
          }}
        />
      )}
      {step === "offers" && <Paywall video={video?.title} onClose={() => setStep("form")} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
        noValidate
        className="flex w-full items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-colors focus-within:border-white/35"
      >
        <label htmlFor={id} className="sr-only">
          Lien de la vidéo YouTube
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-1 pl-4 max-[359px]:pl-3 sm:pl-5">
          <LinkIcon className="hidden size-5 shrink-0 text-muted sm:block" />
          <input
            id={id}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="Colle un lien YouTube"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            aria-invalid={error !== null}
            aria-describedby={`${id}-msg`}
            className="h-12 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-zinc-500 sm:h-[3.25rem] sm:text-[17px]"
          />
        </div>
        {!video && (
          <button
            type="submit"
            className="button-shine inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 text-[16px] font-semibold tracking-[-0.005em] whitespace-nowrap text-black transition-[transform,background-color] duration-150 hover:bg-white/90 focus-visible:ring-4 focus-visible:ring-white/30 active:translate-y-px max-[359px]:px-4 max-[359px]:[&_svg]:hidden sm:h-[3.25rem] sm:px-7 sm:text-[17px]"
          >
            Découper
            <ArrowRight className="size-4" />
          </button>
        )}
      </form>

      {/* La vidéo reconnue, avec le bouton qui lance la suite */}
      {video && (
        <div className="rise-in flex w-full flex-col gap-3 rounded-[24px] border border-white/12 bg-white/[0.05] p-3 text-left shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <div
              className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-black bg-cover bg-center sm:w-40"
              style={{ backgroundImage: `url(${video.thumbnail})` }}
              role="img"
              aria-label="Miniature de la vidéo"
            >
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                  <Play className="size-3.5 translate-x-px" />
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-cash">
                <Check className="size-3.5" /> Vidéo détectée
              </p>
              <p className="mt-0.5 line-clamp-2 text-[15px] leading-snug font-semibold text-ink">
                {video.title ?? "Vidéo YouTube"}
              </p>
              {video.channel && <p className="mt-0.5 truncate text-[13px] text-muted">{video.channel}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void create()}
            disabled={busy}
            className="button-shine inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-[16px] font-semibold tracking-[-0.005em] whitespace-nowrap text-black transition-[transform,background-color] duration-150 hover:bg-white/90 focus-visible:ring-4 focus-visible:ring-white/30 active:translate-y-px disabled:opacity-70"
          >
            {busy ? "Un instant…" : "Créer mes shorts"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      <div id={`${id}-msg`} aria-live="polite" className="empty:hidden">
        {error && <p className="text-center text-sm font-medium text-[#ff9b7a]">{error}</p>}
      </div>

      {!video && <p className="text-[13px] text-zinc-500 sm:text-sm">Sans engagement · Résiliable en un clic</p>}
    </div>
  );
}
