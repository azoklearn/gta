import { Cash, LinkIcon, Scissors } from "./Icons";
import { SectionHeading } from "./Section";

const STEPS = [
  {
    icon: LinkIcon,
    title: "Colle le lien",
    text: "Un live de 3 heures, un let's play, une compilation : n'importe quelle vidéo GTA 6 hébergée sur YouTube fait l'affaire.",
  },
  {
    icon: Scissors,
    title: "L'IA découpe",
    text: "Poursuites, braquages, cascades, fails : ViceClip repère les passages qui retiennent l'attention et les monte en 9:16 avec sous-titres.",
  },
  {
    icon: Cash,
    title: "Poste et encaisse",
    text: "Télécharge tes shorts, publie-les sur TikTok, Shorts et Reels. Chaque vue qualifiée compte pour ta rémunération.",
  },
];

export function Steps() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading eyebrow="Fonctionnement" title="Trois étapes," accent="zéro montage">
        Pas de logiciel à installer, pas de timeline à apprendre. Tu donnes la vidéo, tu récupères les shorts.
      </SectionHeading>

      <ol className="mt-14 grid gap-5 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className="relative overflow-hidden rounded-3xl border border-line bg-panel p-7 transition hover:border-pink/50"
          >
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-6 font-display text-[9rem] leading-none text-white/[0.04]"
            >
              {i + 1}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sunset">
              <Icon className="h-6 w-6 text-white" />
            </span>
            <h3 className="mt-6 font-display text-2xl uppercase tracking-wide">
              <span className="text-pink">{i + 1}.</span> {title}
            </h3>
            <p className="mt-3 leading-relaxed text-mist">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
