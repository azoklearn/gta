import { FacebookMark, InstagramMark, SnapchatMark, TikTokMark, YouTubeMark } from "./Icons";
import { Eyebrow } from "./Section";

const PLATFORMS = [
  { name: "TikTok", Mark: TikTokMark },
  { name: "YouTube Shorts", Mark: YouTubeMark },
  { name: "Instagram Reels", Mark: InstagramMark },
  { name: "Facebook Reels", Mark: FacebookMark },
  { name: "Snapchat Spotlight", Mark: SnapchatMark },
];

function Row({ items, reverse = false }: { items: typeof PLATFORMS; reverse?: boolean }) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden">
      <ul
        className={`flex w-max items-center [animation-duration:48s] motion-reduce:animate-none ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {loop.map(({ name, Mark }, i) => (
          <li
            key={`${name}-${i}`}
            aria-hidden={i >= items.length}
            className="flex shrink-0 items-center gap-1.5 pr-9 text-zinc-400 transition-colors hover:text-white sm:gap-2 sm:pr-16"
          >
            <Mark className="size-6 sm:size-7" />
            <span className="text-[15px] font-semibold tracking-[-0.02em] sm:text-[17px]">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Plateformes pour lesquelles les shorts sont formatés. */
export function Platforms() {
  return (
    <section aria-label="Optimisé pour" className="relative isolate mx-auto w-full max-w-5xl px-4 pt-4 pb-6 sm:px-6">
      <div className="pointer-events-none absolute inset-x-[10%] inset-y-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.025),transparent_70%)]" />
      <Eyebrow className="mx-auto mb-6">Optimisé pour</Eyebrow>
      <div className="flex flex-col gap-4 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] sm:gap-5">
        <Row items={PLATFORMS} />
        <Row items={[...PLATFORMS].reverse()} reverse />
      </div>
    </section>
  );
}
