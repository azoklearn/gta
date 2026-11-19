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

/** Score de viralité sur cinq étoiles, clin d'œil à l'indice de recherche du jeu. */
export function WantedStars({
  level,
  className = "",
  onColor = "text-pink",
  offColor = "text-black/15",
}: {
  level: number;
  className?: string;
  onColor?: string;
  offColor?: string;
}) {
  return (
    <span className={`inline-flex gap-px ${className}`} role="img" aria-label={`Score de viralité ${level} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`aspect-square h-full ${n <= level ? onColor : offColor}`} />
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
export const Download = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14" />
  </svg>
);
export const Plus = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Play = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.6-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" fill="currentColor" />
  </svg>
);

/* Pictogrammes des plateformes de destination */
export const YouTubeGlyph = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect x="2" y="7" width="28" height="18" rx="6" fill="#ff0033" />
    <path d="M13.5 12v8l7-4z" fill="#fff" />
  </svg>
);
export const TikTokGlyph = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    {[
      ["#25f4ee", -1.1, -0.9],
      ["#fe2c55", 1.1, 0.9],
      ["#131313", 0, 0],
    ].map(([fill, dx, dy]) => (
      <path
        key={fill as string}
        transform={`translate(${dx} ${dy})`}
        fill={fill as string}
        d="M17.2 4h3.6c.3 2.7 1.9 4.6 4.7 4.9v3.7c-1.7.1-3.3-.4-4.7-1.300v7.400a6.8 6.8 0 1 1-6.8-6.800c.4 0 .8 0 1.2.1v3.800a3.1 3.1 0 1 0 2 2.900z"
      />
    ))}
  </svg>
);
export const ReelsGlyph = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="reels-g" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#feda75" />
        <stop offset=".35" stopColor="#fa7e1e" />
        <stop offset=".65" stopColor="#d62976" />
        <stop offset="1" stopColor="#4f5bd5" />
      </linearGradient>
    </defs>
    <rect x="4.5" y="4.5" width="23" height="23" rx="7" fill="none" stroke="url(#reels-g)" strokeWidth="2.6" />
    <circle cx="16" cy="16" r="5" fill="none" stroke="url(#reels-g)" strokeWidth="2.6" />
    <circle cx="22.3" cy="9.7" r="1.5" fill="#d62976" />
  </svg>
);
