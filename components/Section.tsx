export function SectionHeading({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-wide sm:text-6xl">
        {title} {accent && <span className="text-sunset">{accent}</span>}
      </h2>
      {children && <p className="mt-5 text-lg leading-relaxed text-mist">{children}</p>}
    </div>
  );
}
