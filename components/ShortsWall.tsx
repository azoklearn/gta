import Image from "next/image";
import { demo } from "@/lib/demo";
import { Eyebrow } from "./Section";

function Row({ images, reverse = false }: { images: string[]; reverse?: boolean }) {
  // La liste est doublée pour que le défilement boucle sans raccord visible.
  return (
    <div className="overflow-hidden">
      <ul className={`flex w-max motion-reduce:animate-none ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {[...images, ...images].map((src, i) => (
          <li key={`${src}-${i}`} className="shrink-0 pr-3 sm:pr-4" aria-hidden={i >= images.length}>
            <div className="relative aspect-[9/16] w-[116px] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] sm:w-[168px]">
              <Image src={src} alt="" fill sizes="(min-width: 640px) 168px, 116px" className="object-cover" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Bandeau défilant de shorts réellement générés par GTAClip. */
export function ShortsWall() {
  const half = Math.ceil(demo.wall.length / 2);
  return (
    <section aria-label="Des shorts générés par GTAClip" className="relative isolate w-full overflow-hidden pt-6 pb-4">
      <Eyebrow className="mx-auto mb-6">De vrais shorts, générés par GTAClip</Eyebrow>
      <div className="flex flex-col gap-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] sm:gap-4">
        <Row images={demo.wall.slice(0, half)} />
        <Row images={demo.wall.slice(half)} reverse />
      </div>
    </section>
  );
}
