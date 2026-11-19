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
    <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading title="Trois étapes, zéro montage">
        Pas de logiciel à installer, pas de timeline à apprendre. Tu donnes la vidéo, tu récupères les shorts.
      </SectionHeading>

      <ol className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {STEPS.map(({ title, text }, i) => (
          <li key={title} className="border-t border-black/10 pt-6">
            <span className="display text-sm tabular-nums text-pink">0{i + 1}</span>
            <h3 className="display mt-3 text-2xl">{title}</h3>
            <p className="mt-2.5 leading-relaxed text-body">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
