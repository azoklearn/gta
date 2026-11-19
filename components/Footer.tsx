import { Logo } from "./Logo";

const LINKS = [
  ["Fonctionnement", "/#fonctionnement"],
  ["Revenus", "/#revenus"],
  ["Tarifs", "/#tarifs"],
  ["FAQ", "/#faq"],
];

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-muted">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-white">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-zinc-500">
        GTAClip (gtaclip.io) est un outil indépendant, ni affilié ni approuvé par Rockstar Games, Take-Two Interactive,
        TikTok ou YouTube. Grand Theft Auto et GTA sont des marques de leurs propriétaires respectifs. Les vidéos et
        les extraits montrés sur cette page restent la propriété de leurs créateurs.
      </p>
    </footer>
  );
}
