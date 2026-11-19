import Image from "next/image";
import { gameImages } from "@/lib/images";
import { WantedStars } from "./Icons";
import { SectionHeading } from "./Section";

function Card({
  title,
  text,
  className = "",
  children,
}: {
  title: string;
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li className={`flex flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-card ${className}`}>
      <div className="p-7 pb-0 sm:p-8 sm:pb-0">
        <h3 className="display text-[1.45rem] leading-tight">{title}</h3>
        <p className="mt-2 max-w-md leading-relaxed text-body">{text}</p>
      </div>
      <div className="mt-7 flex flex-1 flex-col justify-end px-7 pb-7 sm:px-8 sm:pb-8">{children}</div>
    </li>
  );
}

const SCORE = [
  ["Accroche", 94],
  ["Action", 88],
  ["Rythme", 76],
  ["Chute", 91],
] as const;

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading title="Tout le montage, déjà fait">
        Ce qui prend une soirée dans un logiciel de montage est prêt quand ta vidéo a fini de charger.
      </SectionHeading>

      <ul className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-3">
        {/* Recadrage */}
        <Card
          className="lg:col-span-2"
          title="Un recadrage 9:16 qui suit l'action"
          text="Le cadre reste sur le personnage ou le véhicule, même en pleine poursuite. Plus de sujet coupé au bord de l'écran."
        >
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={gameImages.reframe}
              alt="Capture officielle de GTA VI : un couple appuyé sur une voiture verte au bord de la plage"
              width={1800}
              height={1013}
              sizes="(min-width: 1024px) 680px, 90vw"
              className="aspect-[16/8.2] w-full object-cover object-[50%_42%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-3 left-[41%] aspect-[9/16] rounded-xl border-2 border-white shadow-[0_0_0_9999px_rgb(19_19_19/0.55)]"
            >
              <span className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-ink">
                9:16
              </span>
            </div>
            <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
              Source 16:9
            </span>
          </div>
        </Card>

        {/* Score Wanted */}
        <Card
          title="Le score Wanted"
          text="Chaque short reçoit de 1 à 5 étoiles selon son potentiel viral. Publie les 5 étoiles en premier."
        >
          <div className="rounded-2xl border border-black/5 bg-paper p-5">
            <div className="flex items-center justify-between">
              <WantedStars level={5} className="h-5" />
              <span className="display text-3xl tabular-nums">94</span>
            </div>
            <dl className="mt-5 space-y-3.5">
              {SCORE.map(([label, value]) => (
                <div key={label}>
                  <div className="flex justify-between text-[13px]">
                    <dt className="text-body">{label}</dt>
                    <dd className="font-medium tabular-nums text-ink">{value}</dd>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-black/[0.07]">
                    <div className="h-full rounded-full bg-pink" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-black/[0.07] pt-4 text-[13px] text-body">
              Potentiel viral <span className="font-semibold text-ink">très élevé</span> : à publier en premier.
            </p>
          </div>
        </Card>

        {/* Sous-titres */}
        <Card
          title="Des sous-titres animés"
          text="Transcription automatique, mots-clés mis en couleur, styles pensés pour le gaming."
        >
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={gameImages.clips[1]}
              alt=""
              width={720}
              height={1067}
              sizes="(min-width: 1024px) 320px, 90vw"
              className="aspect-[4/3] w-full object-cover object-[50%_12%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
            <p className="display absolute inset-x-0 bottom-4 text-center text-xl uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_0_rgb(0_0_0/0.55)]">
              Personne ne les a
              <br />
              <span className="rounded-md bg-pink px-1.5">vus venir</span>
            </p>
          </div>
        </Card>

        {/* Titres et hashtags */}
        <Card
          title="Titres et hashtags"
          text="Une accroche et des hashtags GTA 6 proposés pour chaque short, prêts à copier."
        >
          <div className="rounded-2xl border border-black/5 bg-paper p-5">
            <p className="text-[13px] text-muted">Titre proposé</p>
            <p className="mt-1 font-semibold leading-snug text-ink">Il sème cinq étoiles en 40 secondes</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {["#gta6", "#gtavi", "#vicecity", "#gaming", "#clips"].map((t) => (
                <li key={t} className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[13px] text-body">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Durée */}
        <Card
          title="Calé au-dessus d'une minute"
          text="TikTok ne rémunère que les vidéos de plus d'une minute. Chaque découpe franchit le seuil."
        >
          <div className="rounded-2xl border border-black/5 bg-paper p-5">
            <div className="flex items-baseline justify-between">
              <span className="display text-3xl tabular-nums">1:04</span>
              <span className="rounded-full bg-cash/10 px-2.5 py-1 text-xs font-semibold text-cash">Éligible</span>
            </div>
            <div className="relative mt-6 h-2 rounded-full bg-black/[0.07]">
              <div className="h-full w-[82%] rounded-full bg-cash" />
              <span className="absolute -top-2 left-[76%] h-6 w-0.5 rounded-full bg-ink" />
            </div>
            <div className="relative mt-2 h-4 text-[11px] tabular-nums text-muted">
              <span className="absolute left-0">0:00</span>
              <span className="absolute left-[76%] -translate-x-1/2 font-medium text-ink">1:00</span>
            </div>
          </div>
        </Card>
      </ul>
    </section>
  );
}
