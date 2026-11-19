import Image from "next/image";
import { ButtonLink } from "./Button";
import { Eyebrow } from "./Section";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="relative isolate flex flex-col items-center gap-5 overflow-hidden rounded-[30px] border border-white/10 px-6 py-16 text-center sm:py-24">
        <Image
          src="/images/city.jpg"
          alt=""
          fill
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="-z-20 object-cover object-[50%_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,10,10,0.82),rgba(10,10,10,0.6)_45%,rgba(10,10,10,0.9))]" />
        <Eyebrow className="bg-black/40 backdrop-blur-md">3 shorts offerts à l&apos;inscription</Eyebrow>
        <h2 className="display max-w-2xl text-[clamp(2.1rem,6vw,3.6rem)] leading-none text-balance text-white">
          Pendant qu&apos;ils jouent, <span className="text-gradient">tes shorts se préparent</span>.
        </h2>
        <p className="type-lead max-w-md text-balance text-ink-soft">
          Colle la vidéo d&apos;un streamer GTA&nbsp;6 et récupère tes premiers shorts en quelques minutes.
        </p>
        <ButtonLink href="#top" size="lg" shine className="mt-2">
          Commencer maintenant
        </ButtonLink>
      </div>
    </section>
  );
}
