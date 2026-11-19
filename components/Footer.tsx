import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-mist/80">
            ViceClip est un outil indépendant. Il n&apos;est ni affilié ni approuvé par Rockstar Games, Take-Two
            Interactive ou TikTok. Grand Theft Auto et GTA sont des marques de leurs propriétaires respectifs. Visuels du jeu © Rockstar Games.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold text-mist">
          <li>
            <a href="#tarifs" className="hover:text-white">
              Tarifs
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-white">
              FAQ
            </a>
          </li>
          <li>
            <a href="#revenus" className="hover:text-white">
              Simulateur de revenus
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
