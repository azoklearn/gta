import Link from "next/link";
import { AccountButton } from "./AccountButton";
import { Logo } from "./Logo";

/** Barre de navigation des pages intérieures (projet, compte, connexion). */
export function SiteHeader({ guestHref, guestLabel }: { guestHref?: string; guestLabel?: string }) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principale"
        className="mx-auto flex h-14 max-w-[920px] items-center justify-between rounded-full border border-white/10 bg-[#0a0a0a]/80 pr-2 pl-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:pl-5"
      >
        <Link href="/" aria-label="GTAClip, accueil">
          <Logo />
        </Link>
        <AccountButton guestHref={guestHref} guestLabel={guestLabel} />
      </nav>
    </header>
  );
}
