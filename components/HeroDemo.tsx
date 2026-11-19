"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { demo } from "@/lib/demo";
import { ArrowRight, Check, Play, Volume, VolumeOff, YouTubeGlyph } from "./Icons";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex w-fit items-center gap-2 rounded-full border border-white/12 bg-black/50 px-3 py-1 text-[12px] font-medium text-ink-soft backdrop-blur-md">
      <span className="size-1.5 rounded-full bg-white/70" />
      {children}
    </p>
  );
}

/** Ce que GTAClip a fait de cette vidéo. */
const STEPS = [
  `${demo.source.minutes} minutes de vidéo analysées`,
  "Facecam repérée et placée en haut",
  `${demo.shorts.length} meilleurs moments découpés et sous-titrés`,
];

function length(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Démonstration du haut de page : la vraie vidéo d'un streamer, et les shorts que GTAClip en a tirés. */
export function HeroDemo() {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [main, ...others] = demo.shorts;

  function toggleSound() {
    const element = video.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
    if (!element.muted) void element.play().catch(() => {});
  }

  return (
    <div className="rise-in relative w-full [--i:6]">
      <div className="mx-auto w-full max-w-4xl rounded-[30px] bg-white/10 p-px shadow-[0_60px_120px_-50px_rgb(255_46_139/0.35)]">
        <div className="relative isolate overflow-hidden rounded-[29px] bg-night">
          <Image
            src={demo.source.image}
            alt=""
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            className="-z-10 scale-125 object-cover opacity-30 blur-3xl"
          />
          <div className="grid items-start gap-5 p-3 sm:grid-cols-[1.3fr_1fr] sm:gap-8 sm:p-6 lg:p-7">
            {/* Avant : la vidéo du streamer */}
            <div className="flex min-w-0 flex-col gap-3">
              <Label>La vidéo du streamer</Label>
              <div className="relative aspect-video overflow-hidden rounded-[18px] border border-white/10 bg-black">
                <Image
                  src={demo.source.image}
                  alt={`Image de la vidéo « ${demo.source.title} »`}
                  fill
                  priority
                  sizes="(min-width: 896px) 480px, 100vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-12 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                    <Play className="size-5 translate-x-px" />
                  </span>
                </span>
                <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums text-white">
                  {demo.source.minutes} min
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <YouTubeGlyph className="mt-0.5 size-6 shrink-0" />
                <p className="min-w-0 text-left">
                  <span className="line-clamp-1 text-[14.5px] leading-snug font-semibold text-ink">{demo.source.title}</span>
                  <span className="block text-[13px] text-muted">{demo.source.channel} · YouTube</span>
                </p>
              </div>
              <ul className="mt-1 hidden flex-col gap-2 rounded-[16px] border border-white/10 bg-black/35 p-3.5 text-left text-[13.5px] text-ink-soft backdrop-blur-md md:flex">
                {STEPS.map((step) => (
                  <li key={step} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cash/15 text-cash">
                      <Check className="size-3" />
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Flèche entre l'avant et l'après */}
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-[56.5%] z-10 hidden size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.6)] sm:grid"
            >
              <ArrowRight className="size-4" />
            </span>

            {/* Après : les shorts générés */}
            <div className="flex min-w-0 flex-col gap-3">
              <Label>Tes shorts, prêts à poster</Label>
              <div className="grid grid-cols-[2.08fr_1fr] gap-2">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[16px] border border-white/10 bg-black">
                  <video
                    ref={video}
                    src={demo.video}
                    poster={main?.image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`Short généré à partir de la vidéo de ${demo.source.channel}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={toggleSound}
                    aria-pressed={!muted}
                    className="group absolute inset-x-0 bottom-0 flex cursor-pointer justify-center bg-gradient-to-t from-black/70 to-transparent px-2 pt-10 pb-2.5"
                  >
                    <span className="flex items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-semibold whitespace-nowrap text-black shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 sm:text-[13.5px]">
                      <span className="grid size-6 place-items-center rounded-full bg-black text-white">
                        {muted ? <VolumeOff className="size-3.5" /> : <Volume className="size-3.5" />}
                      </span>
                      {muted ? "Activer le son" : "Couper le son"}
                    </span>
                  </button>
                </div>
                <div className="grid grid-rows-2 gap-2">
                  {others.slice(0, 2).map((short) => (
                    <div key={short.image} className="relative overflow-hidden rounded-[12px] border border-white/10 bg-black">
                      <Image src={short.image} alt={short.title ? `Short généré : ${short.title}` : `Short généré à partir de la vidéo de ${short.channel}`} fill sizes="140px" className="object-cover" />
                      <span className="absolute right-1 bottom-1 rounded bg-black/75 px-1 py-px text-[10px] font-semibold tabular-nums text-white">
                        {length(short.seconds)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
