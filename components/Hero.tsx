import Image from "next/image";
import { demo } from "@/lib/demo";
import { HeroDemo } from "./HeroDemo";
import { TikTokGlyph, TrendUp } from "./Icons";
import { UrlForm } from "./UrlForm";

type Tone = "views" | "cash";

const TONES: Record<Tone, { value: string; chip: string }> = {
  views: { value: "text-white", chip: "bg-pink/15 text-[#ff8fc1]" },
  cash: { value: "text-cash", chip: "bg-cash/15 text-cash" },
};

/** Notification flottante. Les chiffres sont des exemples, annoncés comme tels. */
function Notice({ value, caption, tone = "views" }: { value: string; caption: string; tone?: Tone }) {
  return (
    <div className="relative isolate">
      <span
        aria-hidden="true"
        className="absolute -inset-5 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(255_46_139/0.34),transparent)] blur-xl"
      />
      <div className="relative flex w-[248px] items-center gap-3 rounded-[20px] border border-white/12 bg-[linear-gradient(180deg,rgba(52,26,44,0.82),rgba(18,9,16,0.92))] py-3 pr-4 pl-3 text-left shadow-[0_24px_60px_-14px_rgba(0,0,0,0.8),0_0_44px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)]">
          <TikTokGlyph className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center justify-between gap-2 text-[11px] leading-none whitespace-nowrap">
            <span className="font-semibold tracking-[0.04em] text-zinc-300 uppercase">TikTok</span>
            <span className="text-zinc-500">maintenant</span>
          </span>
          <span className={`display flex items-center gap-1.5 text-[22px] leading-none tracking-[-0.02em] whitespace-nowrap tabular-nums ${TONES[tone].value}`}>
            {value}
            <span className={`flex size-5 items-center justify-center rounded-full ${TONES[tone].chip}`}>
              <TrendUp className="size-3" />
            </span>
          </span>
          <span className="text-[11.5px] leading-none whitespace-nowrap text-zinc-400">{caption}</span>
        </span>
        <span className="absolute -top-1 -right-1 flex size-3.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70 opacity-60" />
          <span className="relative inline-flex size-3.5 rounded-full border-2 border-black bg-white/70" />
        </span>
      </div>
    </div>
  );
}

/** Version compacte des notifications, pour les petits écrans. */
function MiniNotice({ value, caption, tone = "views" }: { value: string; caption: string; tone?: Tone }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(52,26,44,0.9),rgba(18,9,16,0.95))] py-2 pr-3.5 pl-2 shadow-[0_16px_36px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white">
        <TikTokGlyph className="size-5" />
      </span>
      <span className="flex flex-col gap-1 text-left">
        <span className={`flex items-center gap-1 text-[16px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums ${TONES[tone].value}`}>
          {value}
          <span className={`flex size-4 items-center justify-center rounded-full ${TONES[tone].chip}`}>
            <TrendUp className="size-2.5" />
          </span>
        </span>
        <span className="text-[11px] leading-none whitespace-nowrap text-zinc-400">{caption}</span>
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-x-clip">
      {/* Lueur de coucher de soleil derrière le titre */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px]"
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 pt-28 pb-10 sm:gap-14 sm:px-6 sm:pt-40 lg:gap-16">
        <div className="flex w-full max-w-3xl min-w-0 flex-col items-center gap-5 text-center sm:gap-6">
          <div className="rise-in rounded-full bg-white/10 p-px">
            <p className="inline-flex items-center gap-2 rounded-full bg-night py-1 pr-3 pl-1 text-[11.5px] font-medium whitespace-nowrap text-ink-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] max-[359px]:text-[10px] sm:text-[14px]">
              <span className="flex -space-x-2" aria-hidden="true">
                {demo.wall.slice(0, 3).map((src) => (
                  <span key={src} className="relative flex size-6 shrink-0 overflow-hidden rounded-full border-2 border-night sm:size-8">
                    <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                ))}
              </span>
              <span>
                <strong className="text-gradient font-semibold">3 shorts offerts</strong> pour essayer GTAClip
              </span>
            </p>
          </div>

          <div className="relative w-full pt-14 lg:pt-0">
            <h1 className="display text-[clamp(2.3rem,10vw,5.2rem)] leading-[1.02] text-balance text-ink sm:leading-[0.98] lg:-mx-24">
              <span className="rise-in block [--i:1]">Génère des revenus</span>
              <span className="rise-in mt-[0.06em] block [--i:2] lg:whitespace-nowrap">
                avec GTA&nbsp;6 <span className="text-white/50">maintenant.</span>
              </span>
            </h1>

            <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
              <div className="rise-in absolute top-[112%] -left-[150px] -rotate-6 [--i:5] xl:-left-[215px]">
                <Notice value="350 000" caption="vues · exemple" />
              </div>
              <div className="rise-in absolute top-[108%] -right-[150px] rotate-[5deg] [--i:6] xl:-right-[215px]">
                <Notice value="+689 €" caption="paiement reçu · exemple" tone="cash" />
              </div>
              <div className="rise-in absolute -top-[38%] -right-[250px] hidden rotate-3 [--i:7] xl:block">
                <Notice value="+1 240" caption="abonnés · exemple" />
              </div>
            </div>

            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-between lg:hidden">
              <div className="rise-in origin-top-left -rotate-3 scale-90 [--i:4]">
                <MiniNotice value="350 000" caption="vues · exemple" />
              </div>
              <div className="rise-in origin-top-right rotate-3 scale-90 [--i:5]">
                <MiniNotice value="+689 €" caption="paiement reçu · exemple" tone="cash" />
              </div>
            </div>
          </div>

          <p className="rise-in type-lead max-w-[330px] text-balance text-muted [--i:3] sm:max-w-xl">
            Colle le lien YouTube d&apos;un streamer&nbsp;: tes shorts titrés et sous-titrés sont prêts à poster en
            quelques minutes.
          </p>

          <div id="hero-cta" className="rise-in w-full [--i:4]">
            <UrlForm />
          </div>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}
