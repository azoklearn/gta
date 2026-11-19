import Image from "next/image";
import { demo } from "@/lib/demo";
import { SectionHeading } from "./Section";

function Card({ children, glow }: { children: React.ReactNode; glow: string }) {
  return (
    <div className="relative isolate">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 -bottom-3 -z-10 h-16 rounded-full opacity-40 blur-2xl"
        style={{ background: glow }}
      />
      <article className="panel relative isolate flex h-full flex-col overflow-hidden">{children}</article>
    </div>
  );
}

function Copy({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-auto flex flex-col gap-2 px-5 pt-4 pb-6 sm:px-6">
      <p className="text-[14px] font-semibold text-white/50">{label}</p>
      <h3 className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

const BARS = [0, 0.35, 0.15, 0.5, 0.25];

export function Features() {
  return (
    <section id="fonctionnement" className="mx-auto w-full max-w-6xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
      <SectionHeading
        eyebrow="Ce que fait l'IA"
        title={
          <>
            GTAClip <span className="text-gradient">fait tout pour toi</span>.
          </>
        }
      >
        Le repérage, le titre et le montage&nbsp;: tu colles un lien, GTAClip s&apos;occupe du reste.
      </SectionHeading>

      <div className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-3">
        <Card glow="rgba(255,255,255,0.35)">
          <div className="grid grid-cols-2 gap-1.5 p-1.5">
            {demo.sources.slice(0, 4).map((src) => (
              <div key={src} className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
                <Image src={src} alt="" fill sizes="(min-width: 768px) 180px, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <Copy label="Repérage" title="Les meilleurs moments, trouvés pour toi">
            L&apos;IA regarde toute la vidéo du streamer, repère là où le son et l&apos;image s&apos;emballent et garde
            les passages qui démarrent fort.
          </Copy>
        </Card>

        <Card glow="rgba(255,46,139,0.6)">
          <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.032),transparent_70%)]" />
          <ul className="flex flex-col gap-2.5 p-4">
            {demo.picks.map((short, i) => (
              <li key={short.image} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black">
                  <Image src={short.image} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-ink">
                    {short.title || `Short n° ${i + 1} · ${short.channel}`}
                  </span>
                  <span className="truncate text-[13px] text-muted">
                    {short.title ? `${short.channel} · ` : ""}score {short.score} sur 100 · sous-titré
                  </span>
                </span>
                <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
                  {BARS.map((delay) => (
                    <span
                      key={delay}
                      className="w-[3px] animate-[bar_1.1s_ease-in-out_infinite] rounded-full bg-white/25"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <Copy label="Titre et sous-titres" title="Un titre qui donne envie de rester">
            Chaque short reçoit un titre écrit par l&apos;IA d&apos;après ce qui s&apos;y passe, des sous-titres mot à mot
            et une description prête à coller.
          </Copy>
        </Card>

        <Card glow="rgba(44,209,66,0.5)">
          <div className="flex min-h-[210px] flex-1 flex-col items-center justify-center gap-1 px-4 text-center">
            <span className="display text-[64px] leading-none text-white">0 min</span>
            <span className="text-[15px] text-ink-soft">de montage à faire</span>
          </div>
          <Copy label="Montage automatique" title="Monté et prêt à poster">
            Facecam en haut, jeu en dessous&nbsp;: ton short sort en MP4 1080&nbsp;×&nbsp;1920, à plus d&apos;une minute pour
            rester éligible à la rémunération TikTok.
          </Copy>
        </Card>
      </div>
    </section>
  );
}
