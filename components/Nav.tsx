import { ButtonLink } from "./Button";
import { Logo } from "./Logo";

const LINKS = [
  ["Fonctionnement", "#fonctionnement"],
  ["Revenus", "#revenus"],
  ["Tarifs", "#tarifs"],
  ["FAQ", "#faq"],
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principale"
        className="mx-auto flex h-16 max-w-[900px] items-center justify-between rounded-2xl border border-black/5 bg-white/90 pl-5 pr-2.5 shadow-card backdrop-blur-xl"
      >
        <a href="#top" aria-label="ViceClip, retour en haut">
          <Logo />
        </a>
        <ul className="hidden items-center gap-8 text-[15px] font-semibold text-body md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-ink">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <ButtonLink href="#top" variant="pink" size="sm">
          Essayer
        </ButtonLink>
      </nav>
    </header>
  );
}
