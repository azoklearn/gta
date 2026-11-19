"use client";

import { useState } from "react";
import { Check } from "./Icons";
import { SectionHeading } from "./Section";

const VIEW_STEPS = [1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
const DAYS_PER_MONTH = 30;

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat("fr-FR");

const REQUIREMENTS = [
  "Avoir 18 ans ou plus",
  "10 000 abonnés",
  "100 000 vues sur 30 jours",
  "Des vidéos de plus d'une minute",
  "Du contenu original",
];

function Slider({
  id,
  label,
  display,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] text-muted">
          {label}
        </label>
        <output htmlFor={id} className="display text-xl tabular-nums text-white">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="mt-1"
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}

export function Earnings() {
  const [perDay, setPerDay] = useState(2);
  const [viewsIdx, setViewsIdx] = useState(4);
  const [rpmCents, setRpmCents] = useState(60);

  const views = VIEW_STEPS[viewsIdx];
  const shortsPerMonth = perDay * DAYS_PER_MONTH;
  const monthlyViews = shortsPerMonth * views;
  const monthly = (monthlyViews / 1000) * (rpmCents / 100);

  return (
    <section id="revenus" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Rémunération TikTok"
        title={
          <>
            Combien ça peut <span className="text-gradient">rapporter</span>&nbsp;?
          </>
        }
      >
        Avec le programme Creator Rewards, TikTok paie chaque millier de vues qualifiées sur les vidéos de plus
        d&apos;une minute. Fais le calcul avec tes chiffres.
      </SectionHeading>

      <div className="panel mt-10 overflow-hidden sm:mt-14">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          {/* Réglages */}
          <div className="p-5 sm:p-10">
            {/* Mobile : le résultat reste collé sous la barre de navigation pendant qu'on règle les curseurs */}
            <div
              aria-live="polite"
              className="sticky top-[5rem] z-10 -mx-1 mb-6 rounded-[18px] border border-white/10 bg-[#141416] px-5 py-4 shadow-[0_18px_30px_-18px_rgb(0_0_0/0.9)] lg:hidden"
            >
              <p className="text-sm text-muted">Revenu mensuel estimé</p>
              <p className="display mt-0.5 text-[2.9rem] leading-none tabular-nums text-cash">{euros.format(monthly)}</p>
              <p className="mt-2 text-[13px] tabular-nums text-muted">
                {compact.format(monthlyViews)} vues par mois · {euros.format(monthly * 12)} par an
              </p>
            </div>

            <div className="space-y-5 sm:space-y-7">
              <Slider
                id="per-day"
                label="Shorts publiés par jour"
                display={String(perDay)}
                min={1}
                max={10}
                step={1}
                value={perDay}
                onChange={setPerDay}
              />
              <Slider
                id="views"
                label="Vues qualifiées par short"
                display={plain.format(views)}
                min={0}
                max={VIEW_STEPS.length - 1}
                step={1}
                value={viewsIdx}
                onChange={setViewsIdx}
              />
              <Slider
                id="rpm"
                label="Revenu pour 1 000 vues (RPM)"
                display={`${(rpmCents / 100).toFixed(2).replace(".", ",")} €`}
                min={20}
                max={120}
                step={5}
                value={rpmCents}
                onChange={setRpmCents}
              />
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[14px] font-semibold text-white/50">Ce que TikTok demande</p>
              <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-[14.5px] text-ink-soft sm:grid-cols-2">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-cash" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Résultat */}
          <div className="flex flex-col justify-between border-t border-white/10 bg-white/[0.025] p-5 sm:p-10 lg:border-t-0 lg:border-l">
            <div>
              <div aria-live="polite" className="hidden lg:block">
                <p className="text-[15px] text-muted">Revenu mensuel estimé</p>
                <p className="display mt-2 text-[clamp(3.5rem,9vw,5.25rem)] leading-none tabular-nums text-cash">
                  {euros.format(monthly)}
                </p>
              </div>
              <p className="text-[14px] font-semibold text-white/50 lg:hidden">Le détail du calcul</p>
              <dl className="mt-4 divide-y divide-white/10 border-y border-white/10 text-[15px] lg:mt-8">
                {[
                  ["Shorts publiés par mois", plain.format(shortsPerMonth)],
                  ["Vues qualifiées par mois", compact.format(monthlyViews)],
                  ["Par short publié", euros.format(monthly / shortsPerMonth)],
                  ["Sur un an", euros.format(monthly * 12)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-zinc-500 sm:mt-8">
              Simulation indicative, sans garantie de revenus. Le RPM varie selon ton audience, ton pays et la durée
              de visionnage ; seules les vues jugées qualifiées par TikTok sont rémunérées.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
