"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { uploadVideo } from "@/lib/account";
import { apiUrl } from "@/lib/api";
import type { Clip, Job, JobStep } from "@/lib/types";
import { ButtonLink } from "./Button";
import { Check, Download, WantedStars } from "./Icons";
import { SiteHeader } from "./SiteHeader";

type JobState = Job & { queuePosition: number; canUpload?: boolean };
type Load = { kind: "loading" } | { kind: "missing" } | { kind: "ready"; job: JobState };

const STEP_LABELS: Record<JobStep, string> = {
  download: "Récupération de la vidéo",
  analyze: "Analyse des moments forts",
  render: "Rendu des shorts",
};

function clock(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}

function useJob(id: string): Load {
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const res = await fetch(apiUrl(`/api/jobs/${id}`), { cache: "no-store" });
        if (stopped) return;
        if (res.status === 404) return setLoad({ kind: "missing" });
        const job = (await res.json()) as JobState;
        if (stopped) return;
        setLoad({ kind: "ready", job });
        if (job.status === "done" || job.status === "error") return;
      } catch {
        // Coupure réseau passagère : on réessaie au prochain passage.
      }
      timer = setTimeout(poll, 1500);
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [id]);
  return load;
}

function Progress({ job }: { job: JobState }) {
  const steps: JobStep[] = job.source.kind === "youtube" ? ["download", "analyze", "render"] : ["analyze", "render"];
  const current = steps.indexOf(job.step);
  const overall = job.status === "queued" ? 0 : (current + job.progress) / steps.length;

  return (
    <div className="panel p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display text-2xl">
          {job.status === "queued" ? "En file d'attente" : "Découpage en cours"}
        </h2>
        <span className="display text-2xl tabular-nums text-gradient">{Math.round(overall * 100)} %</span>
      </div>
      <div
        className="mt-4 h-2 rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(overall * 100)}
        aria-label="Avancement du découpage"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink to-orange transition-[width] duration-500"
          style={{ width: `${Math.max(2, overall * 100)}%` }}
        />
      </div>

      {job.status === "queued" && job.queuePosition > 0 && (
        <p className="mt-4 text-[15px] text-ink-soft">
          {job.queuePosition === 1
            ? "Une vidéo passe avant la tienne."
            : `${job.queuePosition} vidéos passent avant la tienne.`}
        </p>
      )}

      <ol className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const done = job.status !== "queued" && i < current;
          const active = job.status === "running" && i === current;
          return (
            <li key={step} className="flex items-center gap-3 text-[15px]">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  done ? "bg-cash text-black" : active ? "bg-pink/20" : "bg-white/10"
                }`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-pink" />
                ) : null}
              </span>
              <span className={active ? "font-semibold text-ink" : done ? "text-ink" : "text-muted"}>
                {STEP_LABELS[step]}
                {active && step === "render" && job.clips.length > 0 && (
                  <span className="font-normal text-ink-soft">
                    {" "}
                    · {Math.min(job.rendered + 1, job.clips.length)} sur {job.clips.length}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-sm text-muted">
        Tu peux laisser cette page ouverte ou y revenir plus tard : le lien reste valable 24 heures.
      </p>
    </div>
  );
}

function ShortCard({ jobId, clip }: { jobId: string; clip: Clip }) {
  const [copied, setCopied] = useState(false);
  const base = apiUrl(`/api/jobs/${jobId}/shorts/${clip.index}`);
  const text = `${clip.caption} ${clip.hashtags.join(" ")}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : la légende reste sélectionnable à la main.
    }
  }

  return (
    <li className="panel flex w-full max-w-[20rem] flex-col overflow-hidden p-3 sm:w-[calc(50%-0.625rem)] sm:max-w-[22rem] lg:w-[calc(33.333%-0.84rem)]">
      <video
        controls
        playsInline
        preload="none"
        poster={`${base}?thumb=1`}
        src={base}
        className="aspect-[9/16] w-full rounded-[16px] bg-black object-cover"
      />
      <div className="flex flex-1 flex-col p-3 pb-2">
        {clip.title && <p className="mb-3 text-[15px] leading-snug font-semibold text-balance">{clip.title}</p>}
        <div className="flex items-center justify-between">
          <WantedStars level={clip.stars} className="h-[18px]" />
          <span className="display text-2xl tabular-nums">{clip.score.total}</span>
        </div>
        <p className="mt-2 text-[13px] tabular-nums text-muted">
          {clock(clip.duration)} · de {clock(clip.start)} à {clock(clip.start + clip.duration)} ·{" "}
          {clip.hasSubtitles ? "Sous-titré" : "Sans sous-titres"}
        </p>

        <dl className="mt-4 space-y-2.5">
          {(
            [
              ["Accroche", clip.score.hook],
              ["Action", clip.score.action],
              ["Rythme", clip.score.pace],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[4.5rem_1fr_1.75rem] items-center gap-2 text-[13px]">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-pink" style={{ width: `${value}%` }} />
              </dd>
              <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 select-all rounded-xl bg-white/[0.05] p-3 text-[13px] leading-relaxed text-ink-soft">{text}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`${base}?download=1`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black transition hover:bg-white/90 active:translate-y-px"
          >
            <Download className="h-4 w-4" /> Télécharger
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-sm font-semibold text-ink transition hover:bg-white/[0.08] active:translate-y-px"
          >
            {copied ? "Copié" : "Copier la légende"}
          </button>
        </div>
      </div>
    </li>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl panel p-8 text-center">
      <h1 className="display text-3xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">{children}</p>
      <ButtonLink href="/#top" className="mt-7">
        Découper une autre vidéo
      </ButtonLink>
    </div>
  );
}

/** Secours quand YouTube refuse de fournir la vidéo : l'utilisateur envoie lui-même le fichier. */
function UploadFallback({ message }: { message?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(file: File | undefined) {
    if (!file || progress !== null) return;
    setError(null);
    setProgress(0);
    const reply = await uploadVideo(file, setProgress);
    if (reply.id) {
      router.push(`/projets/${reply.id}`);
      return;
    }
    setError(reply.error ?? "Le fichier n'a pas pu être envoyé.");
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="panel mx-auto max-w-xl p-8 text-center">
      <h1 className="display text-3xl">YouTube bloque notre serveur</h1>
      <p className="mt-3 leading-relaxed text-ink-soft">{message}</p>
      <p className="mt-3 leading-relaxed text-ink-soft">
        Tu as le fichier de la vidéo ? Envoie-le ici : le découpage se lance tout de suite, sans passer par YouTube.
      </p>
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
          className="button-shine mt-7 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-white px-6 text-[15.5px] font-semibold text-black transition hover:bg-white/90 active:translate-y-px"
        >
          Envoyer le fichier vidéo
        </button>
      ) : (
        <div className="mt-7" aria-live="polite">
          <div
            className="h-2 rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Envoi du fichier"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink to-orange transition-[width] duration-300"
              style={{ width: `${Math.max(2, progress * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            Envoi en cours… {Math.round(progress * 100)} %. Garde cette page ouverte.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-[#ff9b7a]">
          {error}
        </p>
      )}
      <p className="mt-5 text-[13px] text-muted">
        MP4, MOV, MKV ou WebM. Ou{" "}
        <Link href="/#top" className="text-white underline decoration-white/30 underline-offset-4">
          réessaie le lien plus tard
        </Link>
        .
      </p>
    </div>
  );
}

export function ProjectView({ id }: { id: string }) {
  const load = useJob(id);

  return (
    <>
      <SiteHeader guestLabel="Nouvelle vidéo" />
      <main className="relative isolate min-h-screen pb-20 pt-32 sm:pt-36">
        <div className="glow absolute inset-x-0 top-0 -z-10 h-[34rem]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {load.kind === "loading" && <p className="text-center text-ink-soft">Chargement du projet…</p>}

          {load.kind === "missing" && (
            <Notice title="Projet introuvable">
              Ce lien n&apos;existe pas ou les shorts ont expiré : ils sont conservés 24 heures.
            </Notice>
          )}

          {load.kind === "ready" &&
            load.job.status === "error" &&
            (load.job.youtubeBlocked && load.job.canUpload ? (
              <UploadFallback message={load.job.error} />
            ) : (
              <Notice title="Le découpage n'a pas abouti">{load.job.error}</Notice>
            ))}

          {load.kind === "ready" && load.job.status !== "error" && (
            <Results job={load.job} />
          )}
        </div>
      </main>
    </>
  );
}

function Results({ job }: { job: JobState }) {
  const ready = job.clips.filter((c) => c.index <= job.rendered);
  const done = job.status === "done";

  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-muted">
          {job.source.kind === "youtube" ? "Vidéo YouTube" : "Fichier d'essai"}
          {job.source.duration ? ` · ${clock(job.source.duration)}` : ""}
        </p>
        <h1 className="display mt-2 text-balance text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.08]">
          {done ? (ready.length > 1 ? `Tes ${ready.length} shorts sont prêts` : "Ton short est prêt") : job.source.title}
        </h1>
        {done && <p className="mt-3 text-[17px] text-ink-soft">{job.source.title}</p>}
        {job.layout === "facecam" && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[13px] font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-pink" /> Facecam détectée : elle est placée en haut des shorts
          </p>
        )}
      </div>

      {!done && (
        <div className="mx-auto mt-8 max-w-xl">
          <Progress job={job} />
        </div>
      )}

      {ready.length > 0 && (
        <ul className="mt-8 flex flex-wrap justify-center gap-5 sm:mt-10">
          {ready.map((clip) => (
            <ShortCard key={clip.index} jobId={job.id} clip={clip} />
          ))}
        </ul>
      )}

      {done && (
        <p className="mt-8 text-center text-sm text-muted">
          Les shorts sont classés par score et conservés 24 heures. Pense à les télécharger.
        </p>
      )}
    </>
  );
}
