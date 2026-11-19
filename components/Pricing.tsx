import { FREE_TRIAL, PLANS, type Plan } from "@/lib/plans";
import { Check } from "./Icons";
import { PlanButton } from "./PlanButton";
import { SectionHeading } from "./Section";

const FEATURED: Plan["id"] = "expert";

function minutes(n: number): string {
  if (n < 60) return `${n} min`;
  return n % 60 ? `${Math.floor(n / 60)} h ${n % 60}` : `${n / 60} h`;
}

const perShort = (plan: Plan) => (plan.price / plan.shortsPerMonth).toFixed(2).replace(".", ",");

function features(plan: Plan, previous: Plan | undefined): string[] {
  return [
    `${plan.shortsPerVideo} shorts par vidéo`,
    `Vidéos jusqu'à ${minutes(plan.maxMinutes)}`,
    plan.priority >= 3 ? "Priorité maximale dans la file" : plan.priority === 2 ? "Passage prioritaire dans la file" : "Facecam en haut et sous-titres",
    previous ? `Tout ce qu'il y a dans ${previous.name}` : "Export en 1080 × 1920",
  ];
}

function PlanIcon({ id }: { id: Plan["id"] }) {
  const common = { viewBox: "0 0 32 32", className: "h-9 w-9", "aria-hidden": true } as const;
  if (id === "clipper") {
    return (
      <svg {...common}>
        <path d="M9 5h14l6 8-13 15L3 13z" fill="#ff8fc1" />
        <path d="M9 5l-6 8h26l-6-8-7 8z" fill="#ff2e8b" />
        <path d="M3 13l13 15 0-15z" fill="#ff5fa6" />
      </svg>
    );
  }
  if (id === "expert") {
    return (
      <svg {...common}>
        <path d="M4 24l-2-13 8 6 6-10 6 10 8-6-2 13z" fill="#ffb347" />
        <rect x="4" y="24" width="24" height="3.5" rx="1.5" fill="#ff7a3d" />
        <circle cx="16" cy="19" r="2.2" fill="#ff2e8b" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M16 2.5l4 8.4 9.2 1.2-6.7 6.4 1.7 9.100L16 23.200l-8.2 4.4 1.7-9.1-6.7-6.4 9.2-1.200z" fill="#ffc94a" />
      <path d="M16 2.500l4 8.4 9.2 1.2-6.7 6.400L16 16z" fill="#ff9a3d" />
    </svg>
  );
}

export function Pricing() {
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <SectionHeading title="Rentabilisé dès le premier short viral">
        {FREE_TRIAL.shorts} shorts offerts à l&apos;inscription, sans carte bancaire. Ensuite, un abonnement mensuel sans
        engagement, résiliable en un clic.
      </SectionHeading>

      <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-5 sm:mt-14 lg:grid-cols-3 lg:gap-6">
        {PLANS.map((plan, i) => {
          const featured = plan.id === FEATURED;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[22px] bg-white p-7 ${
                featured
                  ? "order-first border-2 border-pink shadow-[0_30px_60px_-30px_rgb(255_46_139/0.55)] lg:order-none"
                  : "border border-black/[0.07] shadow-card"
              }`}
            >
              {featured && (
                <span className="absolute -top-3.5 right-6 rounded-full bg-pink px-3.5 py-1.5 text-xs font-bold tracking-tight text-white">
                  Le plus populaire
                </span>
              )}
              <PlanIcon id={plan.id} />
              <h3 className="display mt-5 text-2xl">{plan.name}</h3>
              <p className="display mt-2 text-[2.1rem] leading-none text-pink">
                {plan.price}&nbsp;€<span className="text-2xl">/mois</span>
              </p>
              <p className="mt-5 text-[15px] text-body">
                <strong className="font-semibold text-ink">{plan.shortsPerMonth} shorts par mois</strong>
                <span className="text-muted"> · soit {perShort(plan)}&nbsp;€ le short</span>
              </p>
              <ul className="mb-8 mt-5 flex-1 space-y-3.5">
                {features(plan, PLANS[i - 1]).map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[15px] text-body">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink" /> {feature}
                  </li>
                ))}
              </ul>
              <PlanButton plan={plan} featured={featured} />
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-[13px] text-muted">
        Paiement sécurisé par Mollie. Les shorts non utilisés ne sont pas reportés au mois suivant.
      </p>
    </section>
  );
}
