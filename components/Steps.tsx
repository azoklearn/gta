import { SectionHeading } from "./Section";

const STEPS = [
  {
    title: "Colle le lien",
    text: "Un live de trois heures, un let's play, une compilation : toute vidéo GTA 6 hébergée sur YouTube convient.",
  },
  {
    title: "ViceClip découpe",
    text: "Poursuites, braquages, cascades, fails : les passages qui retiennent l'attention sont isolés, recadrés et sous-titrés.",
  },
  {
    title: "Publie et encaisse",
    text: "Télécharge tes shorts et poste-les sur TikTok, Shorts et Reels. Chaque vue qualifiée compte pour ta rémunération.",
  },
];

export function Steps() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <SectionHeading title="Trois étapes, zéro montage">
        Pas de logiciel à installer, pas de timeline à apprendre. Tu donnes la vidéo, tu récupères les shorts.
      </SectionHeading>

      <ol className="mt-9 grid gap-x-10 md:mt-12 md:grid-cols-3">
        {STEPS.map(({ title, text }, i) => (
          <li
            key={title}
            className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-black/10 py-5 md:block md:py-0 md:pt-6"
          >
            <span className="display grid h-9 w-9 place-items-center rounded-full bg-pink-soft text-sm tabular-nums text-pink md:block md:h-auto md:w-auto md:bg-transparent">
              0{i + 1}
            </span>
            <div>
              <h3 className="display text-xl md:mt-3 md:text-2xl">{title}</h3>
              <p className="mt-1.5 leading-relaxed text-body md:mt-2.5">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
