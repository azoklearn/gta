import Image from "next/image";
import { gameImages } from "@/lib/images";
import { Download, Play, WantedStars } from "./Icons";

const SHORTS = [
  { title: "Il sème cinq étoiles", length: "1:04", stars: 5, position: "45% 20%" },
  { title: "Le braquage tourne mal", length: "1:12", stars: 4, position: "50% 15%" },
  { title: "La cascade impossible", length: "1:01", stars: 4, position: "55% 15%" },
];

/** Segments repérés sur la timeline, en pourcentage de la durée totale. */
const SEGMENTS = [
  [13, 21],
  [44, 54],
  [76, 83],
];

const BARS = Array.from({ length: 72 }, (_, i) => {
  const height = 22 + Math.abs(Math.sin(i * 1.7) * 46 + Math.sin(i * 0.45) * 28);
  const at = (i / 72) * 100;
  return { height: Math.min(96, Math.round(height)), hot: SEGMENTS.some(([a, b]) => at >= a && at <= b) };
});

/** Maquette de l'interface : la vidéo source à gauche, les shorts générés à droite. */
export function AppMockup() {
  return (
    <div className="rounded-[26px] border border-black/5 bg-white p-1.5 text-left shadow-float sm:rounded-[32px] sm:p-2.5">
      <div className="overflow-hidden rounded-[20px] border border-black/5 bg-paper sm:rounded-[24px]">
        {/* Barre de titre */}
        <div className="flex items-center gap-4 border-b border-black/5 bg-white px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-black/10" />
            ))}
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] text-muted">
            Projets <span className="mx-1 text-black/20">/</span>
            <span className="font-medium text-ink">Live GTA 6 : braquage en direct à Vice City</span>
          </p>
          <span className="hidden items-center gap-1.5 rounded-full bg-pink-soft px-2.5 py-1 text-xs font-semibold text-pink sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-pink" /> 3 shorts prêts
          </span>
        </div>

        <div className="grid gap-2 p-2 sm:gap-3 sm:p-3 lg:grid-cols-[1.55fr_1fr]">
          {/* Vidéo source + timeline */}
          <div className="min-w-0 rounded-2xl border border-black/5 bg-white p-2 sm:p-3">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src={gameImages.source}
                alt="Visuel officiel de GTA VI, utilisé ici comme vidéo d'un streamer"
                width={1600}
                height={900}
                priority
                sizes="(min-width: 1024px) 600px, 92vw"
                className="aspect-video w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                Vidéo du streamer · 16:9
              </span>
              <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 backdrop-blur-md">
                <Play className="h-5 w-5 text-white" />
              </span>
            </div>

            <div className="mt-3 px-1">
              <div className="flex h-10 items-end gap-[2px]" aria-hidden="true">
                {BARS.map((b, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${b.hot ? "bg-pink" : "bg-black/10"}`}
                    style={{ height: `${b.height}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums text-muted">
                <span>0:00</span>
                <span className="font-medium text-ink">3 moments forts repérés</span>
                <span>1:24:18</span>
              </div>
            </div>
          </div>

          {/* Shorts générés */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-black/5 bg-white p-2 sm:p-3">
            <p className="flex items-center justify-between px-1 pb-2 pt-0.5 text-[13px] font-semibold text-ink">
              Shorts générés
              <span className="font-normal text-muted sm:hidden">Fais défiler →</span>
            </p>

            {/* Téléphone et tablette : cartes portrait, en carrousel sur petit écran */}
            <ul className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-2 px-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:hidden">
              {SHORTS.map((s, i) => (
                <li key={s.title} className="relative w-[43%] shrink-0 snap-start overflow-hidden rounded-xl sm:w-auto">
                  <Image
                    src={gameImages.clips[i]}
                    alt=""
                    width={720}
                    height={1067}
                    sizes="(min-width: 640px) 30vw, 45vw"
                    className="aspect-[9/16] w-full object-cover"
                    style={{ objectPosition: s.position }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 via-45% to-black/25" />
                  <span className="absolute right-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur">
                    {s.length}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="text-[13px] font-semibold leading-tight text-white sm:text-[15px]">{s.title}</p>
                    <WantedStars level={s.stars} offColor="text-white/30" className="mt-1.5 h-3" />
                  </div>
                </li>
              ))}
            </ul>

            {/* Ordinateur : liste détaillée */}
            <ul className="hidden flex-1 flex-col gap-2 lg:flex">
              {SHORTS.map((s, i) => (
                <li
                  key={s.title}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-black/5 bg-paper/70 p-2"
                >
                  <Image
                    src={gameImages.clips[i]}
                    alt=""
                    width={720}
                    height={1067}
                    sizes="64px"
                    className="aspect-[9/16] w-12 shrink-0 rounded-lg object-cover sm:w-[3.25rem]"
                    style={{ objectPosition: s.position }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted">{s.length} · 9:16 · Sous-titres</p>
                    <WantedStars level={s.stars} className="mt-1.5 h-3" />
                  </div>
                  <span
                    aria-hidden="true"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-ink"
                  >
                    <Download className="h-4 w-4" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
