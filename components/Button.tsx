import { ArrowRight } from "./Icons";

const VARIANTS = {
  dark: ["bg-ink text-white shadow-button hover:bg-black", "bg-white text-ink"],
  pink: ["bg-pink text-white shadow-[0_10px_24px_-10px_rgb(255_46_139/0.9)] hover:brightness-105", "bg-white text-ink"],
  light: ["bg-white text-ink shadow-card hover:bg-white/90", "bg-ink text-white"],
} as const;

/** Bouton principal : libellé suivi d'une pastille fléchée. */
export function ButtonLink({
  href,
  children,
  variant = "dark",
  size = "md",
  className = "",
  dotClassName = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: "sm" | "md";
  className?: string;
  /** Classes ajoutées à la pastille fléchée (par exemple pour la masquer sur très petit écran). */
  dotClassName?: string;
}) {
  const [shell, dot] = VARIANTS[variant];
  const sizing = size === "sm" ? "h-11 pl-4 pr-1.5 text-sm gap-2.5" : "h-[3.25rem] pl-6 pr-2 text-base gap-4";
  const dotSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <a
      href={href}
      className={`group inline-flex items-center rounded-[14px] font-semibold tracking-tight transition active:scale-[0.98] ${sizing} ${shell} ${className}`}
    >
      {children}
      <span className={`grid place-items-center rounded-full transition group-hover:translate-x-0.5 ${dotSize} ${dot} ${dotClassName}`}>
        <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}
