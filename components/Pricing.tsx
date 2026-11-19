import { Check } from "./Icons";
import { SectionHeading } from "./Section";

const PLANS = [
  {
    name: "Rookie",
    price: "9",
    tagline: "Pour tester sur un compte",
    features: ["30 shorts par mois", "Export 1080p", "Sous-titres automatiques", "Score Wanted"],
    featured: false,
  },
  {
    name: "Hustler",
    price: "24",
    tagline: "Pour publier tous les jours",
    features: [
      "150 shorts par mois",
      "Mode monétisation (+1 min)",
      "Titres et hashtags générés",
      "Sans filigrane",
      "Traitement prioritaire",
    ],
    featured: true,
  },
  {
    name: "Kingpin",
    price: "59",
    tagline: "Pour gérer plusieurs comptes",
    features: ["Shorts illimités", "Export 4K", "Plusieurs comptes TikTok", "Styles de sous-titres sur mesure"],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeading eyebrow="Tarifs" title="Rentabilisé dès" accent="le premier short viral">
        Sans engagement. Commence avec 3 shorts offerts, passe à l&apos;offre supérieure quand ton compte décolle.
      </SectionHeading>

      <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-3xl p-8 ${
              p.featured
                ? "border-2 border-pink bg-gradient-to-b from-pink/15 to-panel shadow-[0_0_80px_-20px_rgb(255_62_165/0.6)]"
                : "border border-line bg-panel"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-sunset px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-white">
                Le plus choisi
              </span>
            )}
            <h3 className="font-display text-3xl uppercase tracking-wide">{p.name}</h3>
            <p className="mt-1 text-sm text-mist">{p.tagline}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-6xl leading-none tracking-wide">{p.price} €</span>
              <span className="text-mist">/ mois</span>
            </p>
            <ul className="mt-7 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-white/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cash" /> {f}
                </li>
              ))}
            </ul>
            <a
              href="#top"
              className={`mt-8 inline-flex h-12 items-center justify-center rounded-full text-base font-extrabold transition active:scale-[0.98] ${
                p.featured ? "bg-sunset text-white hover:brightness-110" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Choisir {p.name}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
