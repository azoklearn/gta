import { Plus } from "./Icons";

const QUESTIONS = [
  {
    q: "Faut-il déjà être monétisé sur TikTok ?",
    a: "Non. Tu peux commencer avec un compte neuf : les shorts servent d'abord à faire grandir ton audience. La rémunération Creator Rewards s'active une fois les seuils de TikTok atteints (10 000 abonnés et 100 000 vues sur 30 jours).",
  },
  {
    q: "Combien de temps prend le découpage ?",
    a: "Quelques minutes pour une vidéo standard. Tu reçois une série de shorts classés par score Wanted, à télécharger un par un ou tous ensemble.",
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
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <h2 className="display text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">Questions fréquentes</h2>
          <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-body">
            L&apos;essentiel à savoir avant de coller ton premier lien.
          </p>
        </div>
        <div className="border-t border-black/10">
          {QUESTIONS.map(({ q, a }) => (
            <details key={q} className="group border-b border-black/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold tracking-tight sm:text-lg [&::-webkit-details-marker]:hidden">
                {q}
                <Plus className="h-5 w-5 shrink-0 text-muted transition group-open:rotate-45 group-open:text-pink" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-body">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
