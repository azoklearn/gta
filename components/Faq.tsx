import { Plus } from "./Icons";

const QUESTIONS = [
  {
    q: "C'est quoi, le clipping ?",
    a: "C'est découper les meilleurs moments d'une vidéo longue (un live, un let's play) pour en faire des shorts. ViceClip le fait automatiquement à partir des vidéos GTA 6 de youtubeurs et de streamers : tu récupères des shorts prêts à poster sur ton compte.",
  },
  {
    q: "Ai-je le droit de publier les moments d'un streamer ?",
    a: "Cela dépend du créateur. Beaucoup encouragent le clipping, certains le rémunèrent même, d'autres l'interdisent. Vérifie les règles de la chaîne, demande l'accord en cas de doute et crédite toujours le créateur dans ta légende.",
  },
  {
    q: "Faut-il déjà être monétisé sur TikTok ?",
    a: "Non. Tu peux commencer avec un compte neuf : les shorts servent d'abord à faire grandir ton audience. La rémunération Creator Rewards s'active une fois les seuils de TikTok atteints (10 000 abonnés et 100 000 vues sur 30 jours). TikTok ne rémunère que le contenu qu'il juge original : ajouter ta voix ou ton commentaire aide.",
  },
  {
    q: "Qu'est-ce qui rend un short « optimisé » ?",
    a: "Le passage est choisi là où le son et l'image s'emballent, avec une préférence pour ceux qui démarrent fort. Le short sort en plein écran vertical, sous-titré, au-dessus d'une minute pour rester éligible à la rémunération, et reçoit un score qui te dit lequel publier en premier.",
  },
  {
    q: "Combien de temps prend le découpage ?",
    a: "Quelques minutes pour une vidéo standard. Tu reçois trois shorts classés par score Wanted, à regarder dans la page puis à télécharger. Ils restent disponibles 24 heures.",
  },
  {
    q: "Mes shorts auront-ils des sous-titres ?",
    a: "Oui quand la vidéo YouTube en propose, y compris les sous-titres générés automatiquement, ce qui est le cas de la plupart des vidéos parlées. Sans sous-titres disponibles, le short sort sans texte.",
  },
  {
    q: "Est-ce que ça marche pour d'autres jeux ?",
    a: "Oui. La détection s'appuie sur le son et l'image : coups de feu, explosions, cris, changements de plan rapides. Elle est réglée pour GTA mais fonctionne sur n'importe quel gameplay.",
  },
  {
    q: "Les revenus affichés sont-ils garantis ?",
    a: "Non. Le simulateur donne un ordre de grandeur à partir de tes propres hypothèses. Tes revenus réels dépendent de ton audience, de la régularité de tes publications et des règles de TikTok.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <div className="grid gap-7 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <h2 className="display text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">Questions fréquentes</h2>
          <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-body">
            L&apos;essentiel à savoir avant de poster ton premier clip.
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
