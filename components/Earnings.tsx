"use client";

import { useState } from "react";
import { Check } from "./Icons";

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
        <label htmlFor={id} className="text-[15px] text-white/60">
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
    <section id="revenus" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
      <div className="rounded-[28px] bg-ink text-white shadow-float sm:rounded-[32px]">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          {/* Réglages */}
          <div className="p-6 sm:p-12">
            <p className="text-sm font-medium text-pink">Rémunération TikTok</p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">
              Combien ça peut rapporter ?
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-white/60">
              Avec le programme Creator Rewards, TikTok paie chaque millier de vues qualifiées sur les vidéos de
              plus d&apos;une minute. Fais le calcul avec tes chiffres.
            </p>

            {/* Mobile : le résultat reste collé sous la barre de navigation pendant qu'on règle les curseurs */}
            <div
              aria-live="polite"
              className="sticky top-[5.5rem] z-10 -mx-2 mt-6 rounded-2xl border border-white/10 bg-[#222] px-5 py-4 shadow-[0_18px_30px_-18px_rgb(0_0_0/0.9)] lg:hidden"
            >
              <p className="text-sm text-white/60">Revenu mensuel estimé</p>
              <p className="display mt-0.5 text-[2.9rem] leading-none tabular-nums text-cash-bright">
                {euros.format(monthly)}
              </p>
              <p className="mt-2 text-[13px] tabular-nums text-white/60">
                {compact.format(monthlyViews)} vues par mois · {euros.format(monthly * 12)} par an
              </p>
            </div>

            <div className="mt-7 space-y-5 sm:mt-10 sm:space-y-7">
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
          </div>

          {/* Résultat */}
          <div className="flex flex-col justify-between rounded-b-[28px] border-t border-white/10 bg-white/[0.04] p-6 sm:rounded-b-[32px] sm:p-12 lg:rounded-bl-none lg:rounded-r-[32px] lg:border-l lg:border-t-0">
            <div>
              <div aria-live="polite" className="hidden lg:block">
                <p className="text-[15px] text-white/60">Revenu mensuel estimé</p>
                <p className="display mt-2 text-[clamp(3.5rem,9vw,5.25rem)] leading-none tabular-nums text-cash-bright">
                  {euros.format(monthly)}
                </p>
              </div>
              <p className="display text-lg lg:hidden">Le détail du calcul</p>
              <dl className="mt-4 divide-y divide-white/10 border-y border-white/10 text-[15px] lg:mt-8">
                {[
                  ["Shorts publiés par mois", plain.format(shortsPerMonth)],
                  ["Vues qualifiées par mois", compact.format(monthlyViews)],
                  ["Par short publié", euros.format(monthly / shortsPerMonth)],
                  ["Sur un an", euros.format(monthly * 12)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3.5">
                    <dt className="text-white/60">{k}</dt>
                    <dd className="font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-6 text-[13px] leading-relaxed text-white/45 sm:mt-8">
              Simulation indicative, sans garantie de revenus. Le RPM varie selon ton audience, ton pays et la
              durée de visionnage ; seules les vues jugées qualifiées par TikTok sont rémunérées.
            </p>
          </div>
        </div>
      </div>

      {/* Conditions du programme */}
      <div className="mt-4 flex flex-col gap-4 rounded-[24px] border border-black/5 bg-white px-6 py-6 shadow-card sm:mt-5 sm:px-7 lg:flex-row lg:items-center lg:gap-8">
        <p className="display shrink-0 text-lg">Ce que TikTok demande</p>
        <ul className="grid gap-x-6 gap-y-2.5 text-[15px] text-body sm:flex sm:flex-wrap">
          {REQUIREMENTS.map((r) => (
            <li key={r} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cash" /> {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
