/** Petite étiquette arrondie placée au-dessus d'un titre de section. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12.5px] font-medium text-ink-soft ${className}`}
    >
      <span className="size-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.12)]" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-2xl flex-col items-center gap-4 text-center ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="display text-[clamp(2.1rem,6vw,3.6rem)] leading-none text-balance text-[#fff1f6]">{title}</h2>
      {children && <p className="type-lead max-w-xl text-balance text-muted">{children}</p>}
    </div>
  );
}
