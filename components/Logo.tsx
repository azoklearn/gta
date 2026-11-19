import { Star } from "./Icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`display inline-flex items-center gap-2 text-[1.3rem] leading-none text-ink ${className}`}>
      <span className="grid size-7 place-items-center rounded-[9px] bg-[linear-gradient(135deg,#ff2e8b,#ff8a3d)]">
        <Star className="size-4 text-white" />
      </span>
      <span>
        GTA<span className="text-white/50">Clip</span>
      </span>
    </span>
  );
}
