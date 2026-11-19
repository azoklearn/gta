import { PLANS, type Plan } from "@/lib/plans";
import { Check } from "./Icons";
import { PlanButton } from "./PlanButton";
import { SectionHeading } from "./Section";

const FEATURED: Plan["id"] = "expert";

function minutes(n: number): string {
  if (n < 60) return `${n} min`;
  return n % 60 ? `${Math.floor(n / 60)} h ${n % 60}` : `${n / 60} h`;
}

const perShort = (plan: Plan) => (plan.price / plan.shortsPerMonth).toFixed(2).replace(".", ",");

function features(plan: Plan, previous: Plan | undefined): string[] {
  return [
    `${plan.shortsPerVideo} shorts par vidéo`,
    `Vidéos jusqu'à ${minutes(plan.maxMinutes)}`,
    plan.priority >= 3 ? "Priorité maximale dans la file" : plan.priority === 2 ? "Passage prioritaire dans la file" : "Titre écrit par l'IA, facecam et sous-titres",
    previous ? `Tout ce qu'il y a dans ${previous.name}` : "Export en 1080 × 1920",
  ];
}

export function Pricing() {
  return (
    <section id="tarifs" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Tarifs"
        title={
          <>
            Rentabilisé dès le <span className="text-gradient">premier short viral</span>.
          </>
        }
      >
        Un abonnement mensuel sans engagement, résiliable en un clic. Tes shorts sont remis à neuf chaque mois.
      </SectionHeading>

      <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-4 sm:mt-14 lg:grid-cols-3">
        {PLANS.map((plan, i) => {
          const featured = plan.id === FEATURED;
          return (
            <div
              key={plan.id}
              className={`relative isolate rounded-[23px] p-px ${
                featured
                  ? "order-first bg-[linear-gradient(160deg,#ff5fa8,#ff8a5c_45%,rgba(255,255,255,0.12)_80%)] shadow-[0_40px_90px_-40px_rgb(255_46_139/0.55)] lg:order-none"
                  : "bg-white/10"
              }`}
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] bg-card p-6 sm:p-7">
                {featured && (
                  <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_46_139/0.16),transparent_70%)]" />
                )}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[22px] leading-none font-semibold tracking-[-0.03em]">{plan.name}</h3>
                  {featured && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold tracking-tight text-black">
                      Le plus populaire
                    </span>
                  )}
                </div>
                <p className="display mt-6 flex items-baseline gap-1.5 text-[3.25rem] leading-none text-white">
                  {plan.price}&nbsp;€<span className="text-[15px] font-medium tracking-normal text-muted">/mois</span>
                </p>
                <p className="mt-4 text-[15px] text-ink-soft">
                  <strong className="font-semibold text-white">{plan.shortsPerMonth} shorts par mois</strong>
                  <span className="text-zinc-500"> · soit {perShort(plan)}&nbsp;€ le short</span>
                </p>
                <ul className="mt-6 mb-8 flex-1 space-y-3 border-t border-white/10 pt-6">
                  {features(plan, PLANS[i - 1]).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-ink-soft">
                      <Check className={`mt-0.5 size-4 shrink-0 ${featured ? "text-[#ff8fc1]" : "text-white/60"}`} /> {feature}
                    </li>
                  ))}
                </ul>
                <PlanButton plan={plan} featured={featured} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-[13px] text-zinc-500">
        Paiement sécurisé par Mollie. Les shorts non utilisés ne sont pas reportés au mois suivant.
      </p>
    </section>
  );
}
