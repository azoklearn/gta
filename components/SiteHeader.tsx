import Link from "next/link";
import { AccountButton } from "./AccountButton";
import { Logo } from "./Logo";

/** Barre de navigation des pages intérieures (projet, compte, connexion). */
export function SiteHeader({ guestHref, guestLabel }: { guestHref?: string; guestLabel?: string }) {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principale"
        className="mx-auto flex h-16 max-w-[900px] items-center justify-between rounded-2xl border border-black/5 bg-white/90 pl-4 pr-2.5 shadow-card backdrop-blur-xl sm:pl-5"
      >
        <Link href="/" aria-label="ViceClip, accueil">
          <Logo />
        </Link>
        <AccountButton guestHref={guestHref} guestLabel={guestLabel} />
      </nav>
    </header>
  );
}
