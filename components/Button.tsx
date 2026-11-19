import Link from "next/link";
import { ArrowRight } from "./Icons";

const SIZES = {
  sm: "h-10 px-4 text-[14px] gap-1.5",
  md: "h-12 px-6 text-[15.5px] gap-2",
  lg: "h-14 px-9 text-[17px] gap-2 sm:h-16 sm:px-11 sm:text-[18px]",
} as const;

const VARIANTS = {
  white: "bg-white text-black hover:bg-white/90",
  ghost: "border border-white/12 bg-white/[0.04] text-ink hover:bg-white/[0.08]",
} as const;

/** Bouton en forme de pilule. Le bouton blanc est l'action principale de la page. */
export function ButtonLink({
  href,
  children,
  variant = "white",
  size = "md",
  shine = false,
  arrow = true,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Fait passer un reflet sur le bouton, pour l'action principale. */
  shine?: boolean;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap outline-none transition-[transform,background-color] duration-150 select-none focus-visible:ring-4 focus-visible:ring-white/30 active:translate-y-px ${SIZES[size]} ${VARIANTS[variant]} ${shine ? "button-shine" : ""} ${className}`}
    >
      {children}
      {arrow && <ArrowRight className="size-4" />}
    </Link>
  );
}
