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
  "10 000 abonnés sur ton compte",
  "100 000 vues sur les 30 derniers jours",
  "Des vidéos de plus d'une minute",
  "Du contenu original, que tu as transformé",
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
        <label htmlFor={id} className="text-sm font-semibold text-mist">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-2xl tracking-wide text-white">
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
        className="mt-4"
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
  const monthlyViews = perDay * DAYS_PER_MONTH * views;
  const monthly = (monthlyViews / 1000) * (rpmCents / 100);

  return (
    <section id="revenus" className="relative isolate overflow-hidden py-20 sm:py-28">
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-[50rem] max-w-full -translate-x-1/2 rounded-full bg-cash/10 blur-[140px]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Rémunération TikTok" title="Combien ça peut" accent="rapporter ?">
          Avec le programme Creator Rewards, TikTok paie les créateurs pour chaque millier de vues qualifiées sur
          leurs vidéos de plus d&apos;une minute. Fais le calcul avec tes chiffres.
        </SectionHeading>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          {/* Simulateur */}
          <div className="rounded-3xl border border-line bg-panel p-6 sm:p-9">
            <div className="space-y-8">
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
                label="Vues qualifiées par short (moyenne)"
                display={plain.format(views)}
                min={0}
                max={VIEW_STEPS.length - 1}
                step={1}
                value={viewsIdx}
                onChange={setViewsIdx}
              />
              <Slider
                id="rpm"
                label="RPM : revenu pour 1 000 vues qualifiées"
                display={`${(rpmCents / 100).toFixed(2).replace(".", ",")} €`}
                min={20}
                max={120}
                step={5}
                value={rpmCents}
                onChange={setRpmCents}
              />
            </div>

            <div className="mt-9 rounded-2xl border border-cash/25 bg-night/60 p-6 text-center" aria-live="polite">
              <p className="text-sm font-semibold uppercase tracking-widest text-mist">Revenu estimé</p>
              <p className="mt-1 font-display text-6xl leading-none tracking-wide sm:text-7xl">
                <span className="text-cash">{euros.format(monthly)}</span>
                <span className="ml-2 text-2xl text-mist sm:text-3xl">/ mois</span>
              </p>
              <p className="mt-4 text-sm text-mist">
                {compact.format(monthlyViews)} vues par mois · soit environ{" "}
                <strong className="text-white">{euros.format(monthly * 12)}</strong> par an
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-mist/75">
              Simulation indicative, sans garantie de revenus. Le RPM varie selon ton audience, ton pays et la
              durée de visionnage ; seules les vues jugées qualifiées par TikTok sont rémunérées.
            </p>
          </div>

          {/* Conditions */}
          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-line bg-panel p-6 sm:p-8">
              <h3 className="font-display text-2xl uppercase tracking-wide">Ce que TikTok demande</h3>
              <ul className="mt-5 space-y-3.5">
                {REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-mist">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cash/15">
                      <Check className="h-3 w-3 text-cash" />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-3xl border border-pink/30 bg-gradient-to-br from-pink/15 via-panel to-panel p-6 sm:p-8">
              <h3 className="font-display text-2xl uppercase tracking-wide">
                Mode <span className="text-sunset">monétisation</span>
              </h3>
              <p className="mt-3 leading-relaxed text-mist">
                Un short de 45 secondes ne rapporte rien. ViceClip cale chaque découpe au-dessus de la minute et
                garde le rythme pour que les spectateurs restent jusqu&apos;au bout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
