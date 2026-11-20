import { Plus } from "./Icons";
import { SectionHeading } from "./Section";

const QUESTIONS = [
  {
    q: "C'est quoi, le clipping ?",
    a: "C'est découper les meilleurs moments d'une vidéo longue (un live, un let's play) pour en faire des shorts. GTAClip le fait automatiquement à partir des vidéos GTA 6 de youtubeurs et de streamers : tu récupères des shorts prêts à poster sur ton compte.",
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
    a: "Le passage est choisi là où le son et l'image s'emballent, avec une préférence pour ceux qui démarrent fort. Le short sort en plein écran vertical, avec la facecam du streamer en haut quand il y en a une, titré, sous-titré, au-dessus d'une minute pour rester éligible à la rémunération, et reçoit un score qui te dit lequel publier en premier.",
  },
  {
    q: "Comment la vidéo arrive-t-elle chez GTAClip ?",
    a: "Tu colles le lien YouTube pour que GTAClip reconnaisse la vidéo, tu choisis ton offre, puis tu nous envoies le fichier de la vidéo depuis ton ordinateur. Un guide t'explique comment la récupérer : depuis YouTube Studio si c'est ta vidéo, ou avec un site ou un logiciel de téléchargement si c'est celle d'un autre créateur, avec son accord. GTAClip ne télécharge pas la vidéo à ta place.",
  },
  {
    q: "Combien de temps prend le découpage ?",
    a: "Quelques minutes pour une vidéo standard. Tu reçois de 3 à 8 shorts selon ton offre, classés par score Wanted, à regarder dans la page puis à télécharger. Ils restent disponibles 24 heures.",
  },
  {
    q: "Mes shorts auront-ils des sous-titres ?",
    a: "Quand YouTube nous laisse récupérer les sous-titres de la vidéo que tu as indiquée, y compris ceux générés automatiquement, ils sont incrustés mot à mot. Quand il refuse ou que la vidéo n'en a pas, le short sort sans sous-titres.",
  },
  {
    q: "Est-ce que ça marche pour d'autres jeux ?",
    a: "Oui. La détection s'appuie sur le son et l'image : coups de feu, explosions, cris, changements de plan rapides. Elle est réglée pour GTA mais fonctionne sur n'importe quel gameplay.",
  },
  {
    q: "Comment fonctionne l'abonnement ?",
    a: "Tu crées ton compte, puis tu choisis une offre mensuelle : ton compteur de shorts est remis à neuf à chaque prélèvement, les shorts non utilisés ne sont pas reportés. Le paiement passe par Mollie et tu peux résilier à tout moment depuis ton compte ; l'offre reste alors active jusqu'à la fin du mois payé.",
  },
  {
    q: "Les revenus affichés sont-ils garantis ?",
    a: "Non. Le simulateur donne un ordre de grandeur à partir de tes propres hypothèses. Tes revenus réels dépendent de ton audience, de la régularité de tes publications et des règles de TikTok.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading eyebrow="FAQ" title="Questions fréquentes">
        L&apos;essentiel à savoir avant de poster ton premier clip.
      </SectionHeading>
      <div className="mt-10 flex flex-col gap-2.5 sm:mt-12">
        {QUESTIONS.map(({ q, a }) => (
          <details key={q} className="panel group px-5 open:bg-white/[0.03] sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4.5 text-left text-[16.5px] font-semibold tracking-[-0.01em] sm:text-[17.5px] [&::-webkit-details-marker]:hidden">
              {q}
              <Plus className="size-5 shrink-0 text-muted transition group-open:rotate-45 group-open:text-white" />
            </summary>
            <p className="pb-5 text-[15.5px] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
