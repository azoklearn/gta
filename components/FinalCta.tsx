import Image from "next/image";
import { gameImages } from "@/lib/images";
import { ButtonLink } from "./Button";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-24">
      <div className="relative isolate overflow-hidden rounded-[32px] px-7 py-14 shadow-float sm:px-14 sm:py-24">
        <Image
          src={gameImages.cta}
          alt="Capture officielle de GTA VI : Vice City au crépuscule"
          fill
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="-z-20 object-cover object-[50%_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/75 to-ink/45 sm:via-ink/60 sm:to-ink/10" />
        <h2 className="display max-w-xl text-[clamp(2rem,5.4vw,3.25rem)] leading-[1.06] text-white">
          La hype GTA&nbsp;6 n&apos;attend pas. Tes shorts non plus.
        </h2>
        <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/75">
          Colle ton premier lien et récupère 3 shorts prêts à poster, sans inscription.
        </p>
        <ButtonLink href="#top" variant="light" className="mt-8 max-sm:w-full max-sm:justify-between">
          Découper ma première vidéo
        </ButtonLink>
      </div>
    </section>
  );
}
