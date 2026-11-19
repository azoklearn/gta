import { Logo } from "./Logo";

const LINKS = [
  ["Fonctionnement", "#fonctionnement"],
  ["Revenus", "#revenus"],
  ["Tarifs", "#tarifs"],
  ["FAQ", "#faq"],
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-night/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Principale">
        <a href="#top" aria-label="ViceClip, retour en haut">
          <Logo />
        </a>
        <ul className="hidden items-center gap-8 text-sm font-semibold text-mist md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-white">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#tarifs"
          className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-night transition hover:bg-sun"
        >
          Commencer
        </a>
      </nav>
    </header>
  );
}
