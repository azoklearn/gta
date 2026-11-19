import { AppMockup } from "./AppMockup";
import { ReelsGlyph, Star, TikTokGlyph, YouTubeGlyph } from "./Icons";
import { UrlForm } from "./UrlForm";

function Tile({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute hidden h-16 w-16 animate-drift place-items-center rounded-[18px] bg-white shadow-float xl:grid ${className}`}
    >
      {children}
    </span>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-14 pt-[6.75rem] sm:pb-24 sm:pt-40">
      <div className="sky absolute inset-x-0 top-0 -z-10 h-[52rem]" />

      <Tile className="left-[5%] top-44 -rotate-12">
        <TikTokGlyph className="h-9 w-9" />
      </Tile>
      <Tile className="left-[9%] top-[24rem] rotate-6 [animation-delay:-3s]">
        <ReelsGlyph className="h-9 w-9" />
      </Tile>
      <Tile className="right-[6%] top-60 rotate-12 [animation-delay:-5s]">
        <YouTubeGlyph className="h-10 w-10" />
      </Tile>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-ink/80 sm:text-[15px]">
            <span className="flex gap-0.5 text-pink" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </span>
            <span className="sm:hidden">Pensé pour GTA 6</span>
            <span className="hidden sm:inline">Le découpeur de shorts pensé pour GTA 6</span>
          </p>

          <h1 className="display mt-4 text-balance text-[clamp(2.2rem,7.2vw,4.4rem)] leading-[1.04] sm:mt-5">
            Tes vidéos GTA&nbsp;6 deviennent <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-pink to-orange box-decoration-clone bg-clip-text pb-[0.12em] text-transparent">
              des shorts qui rapportent
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-body sm:mt-6 sm:text-lg">
            <span className="sm:hidden">Colle un lien YouTube, récupère des shorts 9:16 sous-titrés. </span>
            <span className="hidden sm:inline">
              Colle un lien YouTube. ViceClip repère les meilleurs moments, les recadre en 9:16 et ajoute les
              sous-titres.{" "}
            </span>
            <strong className="font-semibold text-ink">Tu publies, TikTok te rémunère aux vues.</strong>
          </p>

          <div className="mt-6 sm:mt-9">
            <UrlForm />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl sm:mt-16">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}
