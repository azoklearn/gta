import { SectionHeading } from "./Section";

const STEPS = [
  {
    title: "Choisis une vidéo",
    text: "Le live, le let's play ou la compilation GTA 6 d'un youtubeur ou d'un streamer, jusqu'à 1 h 30. Colle simplement son lien YouTube.",
  },
  {
    title: "ViceClip fait les shorts",
    text: "Poursuites, braquages, cascades, fails : les passages qui retiennent l'attention sont isolés, recadrés en 9:16 et sous-titrés.",
  },
  {
    title: "Poste et encaisse",
    text: "Tes shorts sont prêts à poster : télécharge-les et publie-les sur TikTok, Shorts et Reels. Chaque vue qualifiée compte pour ta rémunération.",
  },
];

export function Steps() {
  return (
    <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <SectionHeading title="Tu choisis la vidéo, ViceClip fait les shorts">
        Pas de logiciel de montage, pas de timeline à apprendre. Trois shorts prêts à poster pour chaque vidéo.
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
