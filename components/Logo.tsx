import { Star } from "./Icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-2xl uppercase tracking-wide ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset">
        <Star className="h-5 w-5 text-night" />
      </span>
      <span>
        Vice<span className="text-sunset">Clip</span>
      </span>
    </span>
  );
}
