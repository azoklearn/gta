import { gameImages } from "@/lib/images";
import { GameImage } from "./GameImage";
import { Check, Star } from "./Icons";
import { Pipeline } from "./Pipeline";
import { UrlForm } from "./UrlForm";

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* Fond : visuel du jeu + voile sombre */}
      <div className="absolute inset-0 -z-10">
        <GameImage
          src={gameImages.hero}
          alt=""
          priority
          sizes="100vw"
          position="center 35%"
          className="h-[44rem] w-full opacity-50 [mask-image:linear-gradient(to_bottom,black_35%,transparent_95%)]"
        />
        <div className="absolute inset-x-0 top-0 h-[44rem] bg-gradient-to-b from-night/70 via-night/50 to-transparent" />
        <div className="absolute left-1/2 top-24 h-80 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-pink/25 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sun backdrop-blur">
          <Star className="h-3.5 w-3.5" />
          Le découpeur de shorts GTA 6
        </p>

        <h1 className="mt-6 font-display text-[clamp(2.9rem,10.5vw,6.75rem)] uppercase leading-[0.95] tracking-wide">
          Un lien YouTube.
          <br />
          <span className="text-sunset">Des shorts qui paient.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-mist sm:text-xl">
          ViceClip découpe n&apos;importe quelle vidéo GTA 6 en shorts verticaux prêts à poster : moments forts
          repérés par IA, recadrage 9:16, sous-titres. Tu publies,{" "}
          <strong className="font-bold text-white">TikTok te rémunère aux vues</strong>.
        </p>

        <div className="mt-9">
          <UrlForm />
        </div>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-mist">
          {["3 shorts offerts", "Sans carte bancaire", "Shorts de +1 min, éligibles à la rémunération"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cash" /> {t}
            </li>
          ))}
        </ul>

        <div className="mt-16 sm:mt-20">
          <Pipeline />
        </div>
      </div>
    </section>
  );
}
