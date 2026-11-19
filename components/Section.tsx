export function SectionHeading({
  title,
  children,
  className = "",
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-3xl text-center ${className}`}>
      <h2 className="display text-balance text-[clamp(2rem,5vw,2.9rem)] leading-[1.08]">{title}</h2>
      {children && <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-body">{children}</p>}
    </div>
  );
}
