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
  offColor = "text-white/15",
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
        d="M17.2 4h3.6c.3 2.7 1.9 4.6 4.7 4.9v3.7c-1.7.1-3.3-.4-4.7-1.3v7.4a6.8 6.8 0 1 1-6.8-6.8c.4 0 .8 0 1.2.1v3.8a3.1 3.1 0 1 0 2 2.9z"
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

export const Volume = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" />
  </svg>
);
export const VolumeOff = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </svg>
);
export const TrendUp = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.6} className={className}>
    <path d="M6 17L17 6M9 6h8v8" />
  </svg>
);

/* Plateformes de destination, en une seule couleur (celle du texte) */
export const TikTokMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M17.2 4h3.6c.3 2.7 1.9 4.6 4.7 4.9v3.7c-1.7.1-3.3-.4-4.7-1.3v7.4a6.8 6.8 0 1 1-6.8-6.8c.4 0 .8 0 1.2.1v3.8a3.1 3.1 0 1 0 2 2.9z"
    />
  </svg>
);
export const YouTubeMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M8 7h16a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6zm5.5 5v8l7-4z"
    />
  </svg>
);
export const InstagramMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6">
    <rect x="4.5" y="4.5" width="23" height="23" rx="7" />
    <circle cx="16" cy="16" r="5" />
    <circle cx="22.3" cy="9.7" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);
export const FacebookMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 3a13 13 0 0 0-2.2 25.8v-9h-3.2V16h3.2v-2.9c0-3.2 1.9-4.9 4.8-4.9 1.4 0 2.8.2 2.8.2v3.1h-1.6c-1.6 0-2 1-2 2V16h3.5l-.6 3.8h-2.9v9A13 13 0 0 0 16 3z"
    />
  </svg>
);
export const SnapchatMark = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M16 4c3.9 0 6.6 2.9 6.6 6.8 0 1-.1 2-.1 2.7.5.3 1.3-.2 1.9-.2.8 0 1.5.5 1.5 1.2 0 1.1-1.7 1.5-2.6 2 .7 2.1 2.3 3.8 4.3 4.5.5.2.7.5.6.9-.3.9-2 1.1-3.1 1.4-.3.5-.1 1.3-.9 1.4-1 .1-2.1-.4-3.4.1-1.3.5-2.4 2.2-4.8 2.2s-3.5-1.7-4.8-2.2c-1.3-.5-2.4 0-3.4-.1-.8-.1-.6-.9-.9-1.4-1.1-.3-2.8-.5-3.1-1.4-.1-.4.1-.7.6-.9 2-.7 3.6-2.4 4.3-4.5-.9-.5-2.6-.9-2.6-2 0-.7.7-1.2 1.5-1.2.6 0 1.4.5 1.9.2 0-.7-.1-1.7-.1-2.7C9.4 6.9 12.1 4 16 4z"
    />
  </svg>
);
