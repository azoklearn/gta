import { useId } from "react";

type Variant = "sunset" | "night" | "dawn";

const PALETTES: Record<
  Variant,
  { sky: string[]; sun: [string, string]; city: string; water: [string, string]; glint: string }
> = {
  sunset: {
    sky: ["#1a0a3a", "#5b1a8a", "#e0349b", "#ff8a3c", "#ffd166"],
    sun: ["#fff0b3", "#ff5fa8"],
    city: "#2b0f4d",
    water: ["#4a1672", "#120822"],
    glint: "#ff9ccf",
  },
  night: {
    sky: ["#070419", "#1b1257", "#5a2bb0", "#d13c9f", "#ff8a6b"],
    sun: ["#ffe9f4", "#c78bff"],
    city: "#150a38",
    water: ["#2a1470", "#0a0520"],
    glint: "#b89cff",
  },
  dawn: {
    sky: ["#3a0f4f", "#a3267f", "#ff5f6d", "#ffa24a", "#ffe08a"],
    sun: ["#fffbe0", "#ff9a3c"],
    city: "#4a1447",
    water: ["#7a1f5c", "#1b0a26"],
    glint: "#ffd0a0",
  },
};

const FRONDS: [number, number, number, number][] = [
  [-28, -34, -64, 2],
  [-20, -48, -52, -32],
  [-3, -42, -10, -64],
  [12, -50, 42, -42],
  [28, -36, 64, -2],
  [20, -12, 48, 28],
  [-16, -10, -42, 30],
];

function Palm({ x, y, scale = 1, lean = 0 }: { x: number; y: number; scale?: number; lean?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#0b0516" stroke="#0b0516">
      <path d={`M0 0 Q${10 + lean} -70 ${lean} -140`} fill="none" strokeWidth={6} strokeLinecap="round" />
      <g transform={`translate(${lean} -140)`} stroke="none">
        {FRONDS.map(([cx, cy, ex, ey], i) => (
          <path key={i} d={`M0 0 Q${cx} ${cy} ${ex} ${ey} Q${cx * 0.75} ${cy * 0.55} 0 0Z`} />
        ))}
      </g>
    </g>
  );
}

/**
 * Illustration vectorielle d'ambiance (coucher de soleil, palmiers, skyline).
 * Sert de visuel par défaut tant qu'aucune image n'est fournie.
 */
export function ViceScene({ variant = "sunset", className }: { variant?: Variant; className?: string }) {
  const id = useId();
  const p = PALETTES[variant];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset=".38" stopColor={p.sky[1]} />
          <stop offset=".68" stopColor={p.sky[2]} />
          <stop offset=".88" stopColor={p.sky[3]} />
          <stop offset="1" stopColor={p.sky[4]} />
        </linearGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sun[0]} />
          <stop offset="1" stopColor={p.sun[1]} />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.water[0]} />
          <stop offset="1" stopColor={p.water[1]} />
        </linearGradient>
        <mask id={`${id}-bands`}>
          <rect width="400" height="300" fill="#fff" />
          {[150, 163, 175, 186, 196].map((y, i) => (
            <rect key={y} x="100" y={y} width="200" height={2.5 + i * 1.1} fill="#000" />
          ))}
        </mask>
      </defs>

      <rect width="400" height="205" fill={`url(#${id}-sky)`} />
      <circle cx="200" cy="140" r="68" fill={`url(#${id}-sun)`} mask={`url(#${id}-bands)`} />

      {/* skyline */}
      <rect y="180" width="400" height="25" fill={p.city} />
      <path
        fill={p.city}
        d="M0 205V180h14v-12h10v12h12v-26h16v26h8v-14h12v14h10v-38h6v-8h4v8h6v38h12v-20h16v20h10v-10h12v10h14v-30h14v30h10v-16h10v16h12v-44h5v-10h4v10h5v44h12v-22h16v22h10v-12h12v12h12v-32h14v32h10v-18h14v18h8v-8h12v8h12v-26h10v26h12V205z"
      />

      {/* eau + reflets */}
      <rect y="205" width="400" height="95" fill={`url(#${id}-water)`} />
      <g stroke={p.glint} strokeLinecap="round" opacity=".55">
        <path strokeWidth="2.5" d="M150 216h100" />
        <path strokeWidth="2" d="M165 228h70" />
        <path strokeWidth="2" d="M120 240h40M190 240h60" />
        <path strokeWidth="1.5" d="M175 254h50M100 262h26" />
        <path strokeWidth="1.5" d="M186 272h28" />
      </g>

      <Palm x={46} y={300} scale={1.25} lean={14} />
      <Palm x={92} y={300} scale={0.8} lean={-8} />
      <Palm x={352} y={300} scale={1.15} lean={-16} />
      <Palm x={308} y={300} scale={0.7} lean={8} />
    </svg>
  );
}
