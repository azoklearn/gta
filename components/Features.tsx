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
      <div className="p-6 pb-0 sm:p-8 sm:pb-0">
        <h3 className="display text-[1.45rem] leading-tight">{title}</h3>
        <p className="mt-2 max-w-md leading-relaxed text-body">{text}</p>
      </div>
      <div className="mt-6 flex flex-1 flex-col justify-end px-6 pb-6 sm:mt-7 sm:px-8 sm:pb-8">{children}</div>
    </li>
  );
}

const SCORE = [
  ["Accroche", 94],
  ["Action", 88],
  ["Rythme", 76],
] as const;

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <SectionHeading title="Des shorts optimisés pour devenir viraux">
        Chaque réglage vise la même chose : arrêter le scroll et garder le spectateur jusqu&apos;au bout.
      </SectionHeading>

      <ul className="mt-9 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
        {/* Recadrage */}
        <Card
          className="lg:col-span-2"
          title="Plein écran vertical, sans bandes noires"
          text="Le jeu est recadré au centre, là où se trouve le personnage, et remplit l'écran du téléphone. Si le streamer a une facecam, elle est repérée et placée en haut, le jeu en dessous."
        >
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={gameImages.reframe}
              alt="Capture officielle de GTA VI recadrée au format vertical"
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
          text="Chaque short reçoit de 1 à 5 étoiles, calculées à partir du son et de l'image. Les passages qui démarrent fort sont favorisés."
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
              Note globale <span className="font-semibold text-ink">94 sur 100</span> : à publier en premier.
            </p>
          </div>
        </Card>
      </ul>

      {/* Trois cartes : carrousel à faire défiler sur téléphone et tablette, grille sur ordinateur */}
      <ul className="no-scrollbar -mx-4 -mb-6 -mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 py-6 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:-mt-1 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {/* Sous-titres */}
        <Card
          className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-auto"
          title="Des sous-titres qui retiennent"
          text="Ce que dit le streamer est incrusté à l'écran à partir des sous-titres YouTube. Le mot prononcé passe en couleur."
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
          className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-auto"
          title="Légende et hashtags"
          text="Une légende et des hashtags GTA 6 pour chaque short. Tu copies, tu colles, tu publies."
        >
          <div className="rounded-2xl border border-black/5 bg-paper p-5">
            <p className="text-[13px] text-muted">Légende proposée</p>
            <p className="mt-1 font-semibold leading-snug text-ink">Braquage en direct à Vice City (partie 1)</p>
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
          className="w-[84%] shrink-0 snap-start sm:w-[46%] lg:w-auto"
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
