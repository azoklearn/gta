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
      "Découpes de plus d'une minute",
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
    <section id="tarifs" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <SectionHeading title="Rentabilisé dès le premier short viral">
        Sans engagement. Commence avec 3 shorts offerts, change d&apos;offre quand ton compte décolle.
      </SectionHeading>

      <div className="mt-9 grid items-stretch gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-[28px] p-7 sm:p-8 ${
              p.featured
                ? "order-first bg-ink text-white shadow-float lg:order-none"
                : "border border-black/5 bg-white shadow-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="display text-2xl">{p.name}</h3>
              {p.featured && (
                <span className="rounded-full bg-pink px-3 py-1 text-xs font-semibold text-white">Le plus choisi</span>
              )}
            </div>
            <p className={`mt-1 text-[15px] ${p.featured ? "text-white/60" : "text-body"}`}>{p.tagline}</p>
            <p className="mt-6 flex items-baseline gap-1.5 sm:mt-7">
              <span className="display text-5xl leading-none tabular-nums sm:text-6xl">{p.price} €</span>
              <span className={p.featured ? "text-white/60" : "text-muted"}>/ mois</span>
            </p>
            <a
              href="#top"
              className={`mt-7 inline-flex h-12 items-center justify-center rounded-[14px] text-[15px] font-semibold transition active:scale-[0.98] ${
                p.featured
                  ? "bg-white text-ink hover:bg-white/90"
                  : "bg-ink text-white shadow-button hover:bg-black"
              }`}
            >
              Choisir {p.name}
            </a>
            <ul className={`mt-7 flex-1 space-y-3 border-t pt-7 ${p.featured ? "border-white/10" : "border-black/[0.07]"}`}>
              {p.features.map((f) => (
                <li key={f} className={`flex items-start gap-3 text-[15px] ${p.featured ? "text-white/85" : "text-body"}`}>
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.featured ? "text-pink" : "text-ink"}`} /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
