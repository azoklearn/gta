import { Star } from "./Icons";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`display inline-flex items-center gap-2 text-[1.35rem] leading-none ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-pink">
        <Star className="h-4 w-4 text-white" />
      </span>
      ViceClip
    </span>
  );
}
