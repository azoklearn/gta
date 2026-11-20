import { PlanCards } from "./PlanCards";
import { SectionHeading } from "./Section";

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

      <PlanCards className="mt-10 sm:mt-14" />
      <p className="mt-6 text-center text-[13px] text-zinc-500">
        Paiement sécurisé par Mollie. Les shorts non utilisés ne sont pas reportés au mois suivant.
      </p>
    </section>
  );
}
