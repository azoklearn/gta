"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { Clip, Job, JobStep } from "@/lib/types";
import { ButtonLink } from "./Button";
import { Check, Download, WantedStars } from "./Icons";
import { Logo } from "./Logo";

type JobState = Job & { queuePosition: number };
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

function Header() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principale"
        className="mx-auto flex h-16 max-w-[900px] items-center justify-between rounded-2xl border border-black/5 bg-white/90 pl-4 pr-2.5 shadow-card backdrop-blur-xl sm:pl-5"
      >
        <Link href="/" aria-label="ViceClip, accueil">
          <Logo />
        </Link>
        <ButtonLink href="/#top" variant="pink" size="sm">
          Nouvelle vidéo
        </ButtonLink>
      </nav>
    </header>
  );
}

function Progress({ job }: { job: JobState }) {
  const steps: JobStep[] = job.source.kind === "youtube" ? ["download", "analyze", "render"] : ["analyze", "render"];
  const current = steps.indexOf(job.step);
  const overall = job.status === "queued" ? 0 : (current + job.progress) / steps.length;

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display text-2xl">
          {job.status === "queued" ? "En file d'attente" : "Découpage en cours"}
        </h2>
        <span className="display text-2xl tabular-nums text-pink">{Math.round(overall * 100)} %</span>
      </div>
      <div
        className="mt-4 h-2 rounded-full bg-black/[0.07]"
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
        <p className="mt-4 text-[15px] text-body">
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
                  done ? "bg-cash text-white" : active ? "bg-pink-soft" : "bg-black/[0.06]"
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
                  <span className="font-normal text-body">
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
    <li className="flex w-full max-w-[20rem] flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white p-3 shadow-card sm:w-[calc(50%-0.625rem)] sm:max-w-[22rem] lg:w-[calc(33.333%-0.84rem)]">
      <video
        controls
        playsInline
        preload="none"
        poster={`${base}?thumb=1`}
        src={base}
        className="aspect-[9/16] w-full rounded-[18px] bg-ink object-cover"
      />
      <div className="flex flex-1 flex-col p-3 pb-2">
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
              <dt className="text-body">{label}</dt>
              <dd className="h-1.5 rounded-full bg-black/[0.07]">
                <div className="h-full rounded-full bg-pink" style={{ width: `${value}%` }} />
              </dd>
              <dd className="text-right font-medium tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 select-all rounded-xl bg-paper p-3 text-[13px] leading-relaxed text-body">{text}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`${base}?download=1`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-ink text-sm font-semibold text-white shadow-button transition hover:bg-black active:scale-[0.98]"
          >
            <Download className="h-4 w-4" /> Télécharger
          </a>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-11 items-center justify-center rounded-[14px] border border-black/10 text-sm font-semibold text-ink transition hover:bg-paper active:scale-[0.98]"
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
    <div className="mx-auto max-w-xl rounded-[28px] border border-black/5 bg-white p-8 text-center shadow-card">
      <h1 className="display text-3xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-body">{children}</p>
      <ButtonLink href="/#top" className="mt-7">
        Découper une autre vidéo
      </ButtonLink>
    </div>
  );
}

export function ProjectView({ id }: { id: string }) {
  const load = useJob(id);

  return (
    <>
      <Header />
      <main className="relative isolate min-h-screen pb-20 pt-32 sm:pt-36">
        <div className="sky absolute inset-x-0 top-0 -z-10 h-[30rem] opacity-70" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {load.kind === "loading" && <p className="text-center text-body">Chargement du projet…</p>}

          {load.kind === "missing" && (
            <Notice title="Projet introuvable">
              Ce lien n&apos;existe pas ou les shorts ont expiré : ils sont conservés 24 heures.
            </Notice>
          )}

          {load.kind === "ready" && load.job.status === "error" && (
            <Notice title="Le découpage n'a pas abouti">{load.job.error}</Notice>
          )}

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
        <p className="text-sm font-medium text-ink/70">
          {job.source.kind === "youtube" ? "Vidéo YouTube" : "Fichier d'essai"}
          {job.source.duration ? ` · ${clock(job.source.duration)}` : ""}
        </p>
        <h1 className="display mt-2 text-balance text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.08]">
          {done ? (ready.length > 1 ? `Tes ${ready.length} shorts sont prêts` : "Ton short est prêt") : job.source.title}
        </h1>
        {done && <p className="mt-3 text-[17px] text-body">{job.source.title}</p>}
        {job.layout === "facecam" && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[13px] font-medium text-ink shadow-card">
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
