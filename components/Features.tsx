import { Captions, Crop, Hash, Sparkles, Star, Timer } from "./Icons";
import { SectionHeading } from "./Section";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Détection des moments forts",
    text: "L'IA analyse l'image et le son pour isoler les passages où il se passe vraiment quelque chose.",
  },
  {
    icon: Crop,
    title: "Recadrage 9:16 qui suit l'action",
    text: "Le cadre reste centré sur le personnage ou le véhicule, même en pleine poursuite.",
  },
  {
    icon: Captions,
    title: "Sous-titres animés",
    text: "Transcription automatique, mots-clés mis en couleur, styles pensés pour le gaming.",
  },
  {
    icon: Star,
    title: "Score Wanted",
    text: "Chaque short reçoit de 1 à 5 étoiles selon son potentiel viral. Publie les 5 étoiles en premier.",
  },
  {
    icon: Hash,
    title: "Titres et hashtags",
    text: "Une accroche et des hashtags GTA 6 proposés pour chaque short, prêts à copier.",
  },
  {
    icon: Timer,
    title: "Découpes de plus d'une minute",
    text: "Des durées calées sur les règles de rémunération de TikTok, sans y penser.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading eyebrow="Fonctionnalités" title="Tout le montage," accent="déjà fait" />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-3xl border border-line bg-panel p-7 transition hover:border-pink/50">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-pink/30 bg-pink/10">
              <Icon className="h-5 w-5 text-pink" />
            </span>
            <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
            <p className="mt-2 leading-relaxed text-mist">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
