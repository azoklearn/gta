import { SectionHeading } from "./Section";

const QUESTIONS = [
  {
    q: "Faut-il déjà être monétisé sur TikTok ?",
    a: "Non. Tu peux commencer avec un compte neuf : les shorts servent d'abord à faire grandir ton audience. La rémunération Creator Rewards s'active une fois les seuils de TikTok atteints (10 000 abonnés et 100 000 vues sur 30 jours).",
  },
  {
    q: "Combien de temps prend le découpage ?",
    a: "Quelques minutes pour une vidéo standard. Tu reçois une série de shorts classés par Score Wanted, à télécharger un par un ou tous ensemble.",
  },
  {
    q: "Quelles vidéos puis-je utiliser ?",
    a: "Tes propres gameplays, ou des vidéos dont l'auteur t'a donné l'accord. TikTok ne rémunère que le contenu original : ajoute ta voix, ton commentaire ou ton montage pour mettre toutes les chances de ton côté.",
  },
  {
    q: "Est-ce que ça marche pour d'autres jeux ?",
    a: "La détection est entraînée sur les situations typiques de GTA : poursuites, fusillades, braquages, cascades. Elle fonctionne aussi sur GTA V et GTA Online.",
  },
  {
    q: "Les revenus affichés sont-ils garantis ?",
    a: "Non. Le simulateur donne un ordre de grandeur à partir de tes propres hypothèses. Tes revenus réels dépendent de ton audience, de la régularité de tes publications et des règles de TikTok.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading eyebrow="FAQ" title="Questions" accent="fréquentes" />
      <div className="mt-12 space-y-3">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="group rounded-2xl border border-line bg-panel open:border-pink/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left text-base font-bold sm:p-6 sm:text-lg [&::-webkit-details-marker]:hidden">
              {q}
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-pink transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-mist sm:px-6 sm:pb-6">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
