import { ArrowRight } from "./Icons";
import { gameImages } from "@/lib/images";
import { GameImage } from "./GameImage";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="absolute inset-0 -z-20">
          <GameImage
            src={gameImages.cta}
            variant="night"
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-night/70" />
        <h2 className="mx-auto max-w-3xl font-display text-4xl uppercase leading-none tracking-wide sm:text-6xl">
          La hype GTA 6 n&apos;attend pas. <span className="text-sunset">Tes shorts non plus.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
          Colle ton premier lien et récupère 3 shorts offerts, prêts à poster.
        </p>
        <a
          href="#top"
          className="group mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-lg font-extrabold text-night transition hover:bg-sun active:scale-[0.98]"
        >
          Découper ma première vidéo
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
