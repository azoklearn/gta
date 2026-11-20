"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { forgetUrl, lookupVideo, pendingUrl, uploadVideo, useAccount, type VideoPreview } from "@/lib/account";
import { findPlan, FREE_TRIAL } from "@/lib/plans";
import { parseYouTubeId } from "@/lib/youtube";
import { ButtonLink } from "./Button";
import { Check, Download, Play } from "./Icons";

const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const EXTENSIONS = /\.(mp4|mov|mkv|webm|m4v)$/i;

function length(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  return minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60}` : `${minutes / 60} h`;
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="panel p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[14px] font-bold text-black">
          {number}
        </span>
        <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.02em]">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </li>
  );
}

/**
 * Après le paiement : explique comment récupérer la vidéo sur son ordinateur, puis la reçoit et lance
 * le découpage. Le lien collé sur la page d'accueil est repris pour montrer la vidéo concernée.
 */
export function ImportView() {
  const router = useRouter();
  const { status, account } = useAccount();
  const paid = useSearchParams().get("paiement") === "ok";
  const input = useRef<HTMLInputElement>(null);
  const [link] = useState(() => (typeof window === "undefined" ? null : pendingUrl()));
  const [details, setDetails] = useState<VideoPreview | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoId = link ? parseYouTubeId(link) : null;
  const video: VideoPreview | null = videoId
    ? (details ?? { id: videoId, title: null, channel: null, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` })
    : null;

  useEffect(() => {
    if (status === "guest") router.replace("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (!link) return;
    let stale = false;
    void lookupVideo(link).then((found) => {
      if (!stale && found) setDetails(found);
    });
    return () => {
      stale = true;
    };
  }, [link]);

  if (status !== "ready" || !account) return <p className="text-center text-ink-soft">Chargement…</p>;

  const plan = findPlan(account.plan);
  const maxMinutes = (plan ?? FREE_TRIAL).maxMinutes;
  const command = `yt-dlp -S "res:1080,ext:mp4:m4a" --merge-output-format mp4 "${link ?? "LIEN-DE-LA-VIDEO"}"`;

  async function send(file: File | undefined) {
    if (!file || progress !== null) return;
    if (!EXTENSIONS.test(file.name)) {
      setError("Ce fichier n'est pas une vidéo prise en charge. Envoie un fichier MP4, MOV, MKV ou WebM.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ce fichier dépasse 2 Go. Télécharge la vidéo en 1080p ou en 720p pour qu'elle soit plus légère.");
      return;
    }
    setError(null);
    setProgress(0);
    const reply = await uploadVideo(file, setProgress, { url: link, title: video?.title, channel: video?.channel });
    if (reply.id) {
      forgetUrl();
      router.push(`/projets/${reply.id}`);
      return;
    }
    setError(reply.error ?? "Le fichier n'a pas pu être envoyé.");
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : la commande reste sélectionnable à la main.
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        {paid && plan && (
          <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-cash/30 bg-cash/10 px-3.5 py-1.5 text-[13.5px] font-medium text-ink">
            <Check className="size-4 text-cash" /> Paiement confirmé : ton offre {plan.name} est active
          </p>
        )}
        <h1 className="display text-[clamp(2rem,6vw,3.2rem)] leading-none text-balance">
          Envoie ta vidéo, <span className="text-gradient">on s&apos;occupe du reste</span>.
        </h1>
        <p className="type-lead mx-auto mt-4 max-w-xl text-balance text-muted">
          Deux étapes de ton côté : récupérer la vidéo sur ton ordinateur, puis nous l&apos;envoyer.
        </p>
      </div>

      {video && (
        <div className="panel mt-8 flex items-center gap-4 p-3">
          <div
            className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-black bg-cover bg-center sm:w-48"
            style={{ backgroundImage: `url(${video.thumbnail})` }}
            role="img"
            aria-label="Miniature de la vidéo"
          >
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Play className="size-4 translate-x-px" />
              </span>
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-muted">Ta vidéo</p>
            <p className="mt-0.5 line-clamp-2 text-[16px] leading-snug font-semibold">{video.title ?? "Vidéo YouTube"}</p>
            {video.channel && <p className="mt-0.5 truncate text-[13.5px] text-muted">{video.channel}</p>}
          </div>
        </div>
      )}

      <ol className="mt-5 space-y-4">
        <Step number={1} title="Télécharge la vidéo sur ton ordinateur">
          <p>
            <strong className="font-semibold text-ink">C&apos;est ta propre vidéo&nbsp;:</strong> dans YouTube Studio, ouvre
            «&nbsp;Contenu&nbsp;», clique sur les trois points à côté de la vidéo, puis sur «&nbsp;Télécharger&nbsp;».
          </p>
          <p>
            <strong className="font-semibold text-ink">C&apos;est la vidéo d&apos;un autre créateur&nbsp;:</strong> avec son
            accord, récupère-la avec un logiciel de téléchargement installé sur ton ordinateur. Avec yt-dlp, gratuit et open
            source, colle cette commande dans un terminal&nbsp;:
          </p>
          <div className="flex items-stretch gap-2">
            <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto rounded-[12px] border border-white/10 bg-black/60 px-3.5 py-3 font-mono text-[12.5px] whitespace-nowrap text-ink-soft select-all">
              {command}
            </code>
            <button
              type="button"
              onClick={copy}
              className="shrink-0 cursor-pointer rounded-[12px] border border-white/12 bg-white/[0.05] px-3.5 text-[13.5px] font-semibold text-ink transition hover:bg-white/[0.1]"
            >
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
          <p className="text-[13.5px] text-muted">
            Garde la vidéo entière, en MP4 et en 1080p si possible. Ton offre accepte les vidéos jusqu&apos;à{" "}
            {length(maxMinutes)}.
          </p>
        </Step>

        <Step number={2} title="Envoie le fichier ici">
          {account.credits > 0 ? (
            <>
              <input
                ref={input}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.mkv,.webm,.m4v"
                className="sr-only"
                aria-label="Fichier vidéo à découper"
                onChange={(e) => void send(e.target.files?.[0])}
              />
              {progress === null ? (
                <button
                  type="button"
                  onClick={() => input.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    void send(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-[18px] border-2 border-dashed px-5 py-10 text-center transition-colors ${
                    dragging ? "border-white/60 bg-white/[0.08]" : "border-white/15 bg-white/[0.03] hover:border-white/35"
                  }`}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white text-black">
                    <Download className="size-5 rotate-180" />
                  </span>
                  <span className="text-[16px] font-semibold text-ink">Dépose ta vidéo ici, ou clique pour la choisir</span>
                  <span className="text-[13.5px] text-muted">MP4, MOV, MKV ou WebM · 2 Go maximum</span>
                </button>
              ) : (
                <div className="rounded-[18px] border border-white/12 bg-white/[0.03] px-5 py-8" aria-live="polite">
                  <div className="flex items-end justify-between gap-4">
                    <p className="text-[16px] font-semibold text-ink">Envoi de ta vidéo…</p>
                    <span className="display text-gradient text-[2rem] leading-none tabular-nums">
                      {Math.round(progress * 100)}&nbsp;%
                    </span>
                  </div>
                  <div
                    className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress * 100)}
                    aria-label="Envoi du fichier"
                  >
                    <div
                      className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-pink to-orange transition-[width] duration-300"
                      style={{ width: `${Math.max(3, progress * 100)}%` }}
                    >
                      <span className="absolute inset-0 animate-[stripes_1s_linear_infinite] bg-[linear-gradient(110deg,transparent_0_35%,rgb(255_255_255/0.35)_50%,transparent_65%_100%)] bg-[length:48px_100%]" />
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] text-muted">Garde cette page ouverte jusqu&apos;à la fin de l&apos;envoi.</p>
                </div>
              )}
              {error && (
                <p role="alert" className="text-sm font-medium text-[#ff9b7a]">
                  {error}
                </p>
              )}
            </>
          ) : (
            <>
              <p>
                {plan
                  ? "Tu as utilisé tous les shorts de ton offre ce mois-ci."
                  : "Il te faut une offre pour envoyer une vidéo et créer tes shorts."}
              </p>
              <ButtonLink href="/#tarifs" shine>
                {plan ? "Passer à l'offre supérieure" : "Choisir une offre"}
              </ButtonLink>
            </>
          )}
        </Step>

        <Step number={3} title="Récupère tes shorts">
          <p>
            Le découpage démarre dès la fin de l&apos;envoi. Quelques minutes plus tard, tes shorts sont prêts à regarder et à
            télécharger, classés par score.
          </p>
        </Step>
      </ol>
    </div>
  );
}
