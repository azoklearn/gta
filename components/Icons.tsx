type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Star({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.6l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.6l-5.9 3.2 1.2-6.6-4.9-4.6 6.7-.9z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Niveau de recherche façon « étoiles » : sert de score de viralité. */
export function WantedStars({ level, className = "" }: { level: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`Score de viralité ${level} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= level} className={`h-full aspect-square ${n <= level ? "text-sun" : "text-white/35"}`} />
      ))}
    </span>
  );
}

export const LinkIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </svg>
);
export const Scissors = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="6" cy="6.5" r="2.8" />
    <circle cx="6" cy="17.5" r="2.8" />
    <path d="M8.3 8.2 20 18M8.3 15.8 20 6" />
  </svg>
);
export const Cash = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M6 9.5v5M18 9.5v5" />
  </svg>
);
export const Sparkles = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7z" />
    <path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  </svg>
);
export const Crop = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="7.5" y="2.5" width="9" height="19" rx="2.2" />
    <path d="M3 7v10M21 7v10" strokeDasharray="2 2.6" />
  </svg>
);
export const Captions = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="M6.5 14.5h4M13 14.5h4.5M6.5 11h7" />
  </svg>
);
export const Hash = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M9.5 3.5l-2 17M16.5 3.5l-2 17M4 9h17M3 15h17" />
  </svg>
);
export const Timer = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.5 2M9.5 2.8h5" />
  </svg>
);
export const Check = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const ArrowRight = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.2} className={className}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);
export const Play = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.6-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" fill="currentColor" />
  </svg>
);
