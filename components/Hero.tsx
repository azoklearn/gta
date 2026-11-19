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
    <section id="top" className="relative isolate overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
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
          <p className="inline-flex flex-col items-center gap-2 text-[15px] font-medium text-ink/80 sm:flex-row">
            <span className="flex gap-0.5 text-pink" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </span>
            Le découpeur de shorts pensé pour GTA 6
          </p>

          <h1 className="display mt-5 text-balance text-[clamp(2.4rem,7.2vw,4.4rem)] leading-[1.04]">
            Tes vidéos GTA&nbsp;6 deviennent <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-pink to-orange bg-clip-text pb-[0.12em] text-transparent max-md:block">
              des shorts qui rapportent
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-body sm:text-lg">
            Colle un lien YouTube. ViceClip repère les meilleurs moments, les recadre en 9:16 et ajoute les
            sous-titres. <strong className="font-semibold text-ink">Tu publies, TikTok te rémunère aux vues.</strong>
          </p>

          <div className="mt-9">
            <UrlForm />
          </div>
          <p className="mt-4 text-sm text-muted">3 shorts offerts · Sans carte bancaire</p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl sm:mt-16">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}
