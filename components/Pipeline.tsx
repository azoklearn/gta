import { gameImages } from "@/lib/images";
import { GameImage } from "./GameImage";
import { Play, Scissors, WantedStars } from "./Icons";

const CLIPS = [
  {
    variant: "sunset" as const,
    accent: "bg-sun",
    segment: "left-[14%] w-[9%] bg-sun",
    caption: ["IL SÈME", "5 ÉTOILES"],
    stars: 5,
    length: "1:04",
    position: "30% center",
    tilt: "-rotate-3 sm:translate-y-4",
    anim: "animate-float",
  },
  {
    variant: "night" as const,
    accent: "bg-pink",
    segment: "left-[46%] w-[11%] bg-pink",
    caption: ["LE BRAQUAGE", "TOURNE MAL"],
    stars: 4,
    length: "1:12",
    position: "center",
    tilt: "sm:-translate-y-3",
    anim: "animate-float-slow",
  },
  {
    variant: "dawn" as const,
    accent: "bg-violet",
    segment: "left-[78%] w-[8%] bg-violet",
    caption: ["CASCADE", "IMPOSSIBLE"],
    stars: 4,
    length: "1:01",
    position: "70% center",
    tilt: "rotate-3 sm:translate-y-6",
    anim: "animate-float",
  },
];

/** Visuel « avant / après » : une vidéo YouTube 16:9 devient trois shorts 9:16. */
export function Pipeline() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-5 lg:grid-cols-[1.15fr_auto_1fr] lg:gap-6">
      {/* Vidéo source */}
      <figure className="overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-black/60">
        <div className="relative">
          <GameImage
            src={gameImages.source}
            alt="Vidéo de gameplay GTA 6 sur YouTube"
            sizes="(min-width: 1024px) 480px, 100vw"
            className="aspect-video w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
            Vidéo YouTube · 16:9
          </span>
          <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur-md">
            <Play className="h-6 w-6 text-white" />
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold tabular-nums">
            24:18
          </span>
        </div>
        <figcaption className="p-4">
          <p className="truncate text-sm font-bold">GTA 6 — 24 minutes de chaos à Vice City</p>
          {/* Timeline avec les moments repérés */}
          <div className="relative mt-3 h-2 rounded-full bg-white/10">
            {CLIPS.map((c) => (
              <span key={c.segment} className={`absolute top-0 h-full rounded-full ${c.segment}`} />
            ))}
          </div>
          <p className="mt-2 text-xs text-mist">3 moments forts repérés sur la timeline</p>
        </figcaption>
      </figure>

      {/* Ciseaux */}
      <div className="flex items-center justify-center gap-3 lg:flex-col">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-pink lg:h-10 lg:w-px lg:bg-gradient-to-b" />
        <span className="grid h-12 w-12 place-items-center rounded-full bg-sunset shadow-[0_0_30px_rgb(255_62_165/0.6)]">
          <Scissors className="h-5 w-5 rotate-90 text-white lg:rotate-0" />
        </span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-pink lg:h-10 lg:w-px lg:bg-gradient-to-t" />
      </div>

      {/* Shorts générés */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {CLIPS.map((c, i) => (
          <div key={c.length} className={`w-1/3 max-w-[9.5rem] ${c.tilt}`}>
            <div
              className={`relative overflow-hidden rounded-[1.25rem] border-2 border-white/15 bg-panel shadow-2xl shadow-black/70 ${c.anim}`}
            >
              <GameImage
                src={gameImages.clips[i]}
                variant={c.variant}
                position={c.position}
                sizes="160px"
                className="aspect-[9/16] w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 from-5% via-black/45 via-35% to-black/25" />
              <span className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <span className="absolute right-2 top-3 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                {c.length}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-2 text-center sm:p-2.5">
                <p className="font-display text-[13px] uppercase leading-[1.05] tracking-wide drop-shadow-[0_2px_2px_rgb(0_0_0/0.9)] sm:text-base">
                  {c.caption[0]}
                  <br />
                  <span className="text-sun">{c.caption[1]}</span>
                </p>
                <WantedStars level={c.stars} className="mt-1.5 h-3 sm:h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
