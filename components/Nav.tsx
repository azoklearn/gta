"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "@/lib/account";
import { AccountButton } from "./AccountButton";
import { Logo } from "./Logo";

const LINKS = [
  ["Fonctionnement", "#fonctionnement"],
  ["Revenus", "#revenus"],
  ["Tarifs", "#tarifs"],
  ["FAQ", "#faq"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const { status } = useAccount();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Principale"
        className={`mx-auto max-w-[920px] border border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-colors ${
          open ? "rounded-[26px] bg-[#0a0a0a]" : "rounded-full bg-[#0a0a0a]/80"
        }`}
      >
        <div className="flex h-14 items-center justify-between pr-2 pl-4 sm:pl-5">
          <a href="#top" aria-label="GTAClip, retour en haut" onClick={() => setOpen(false)}>
            <Logo />
          </a>
          <ul className="hidden items-center gap-8 text-[14.5px] font-medium text-muted md:flex">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="transition hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            {status === "guest" && (
              <Link href="/connexion" className="hidden px-3 text-[14.5px] font-medium text-muted transition hover:text-white sm:block">
                Connexion
              </Link>
            )}
            <AccountButton guestHref="#top" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="relative grid size-10 place-items-center rounded-full border border-white/12 text-ink transition active:scale-95 md:hidden"
            >
              <span className={`absolute h-0.5 w-4 rounded-full bg-current transition ${open ? "rotate-45" : "-translate-y-[3.5px]"}`} />
              <span className={`absolute h-0.5 w-4 rounded-full bg-current transition ${open ? "-rotate-45" : "translate-y-[3.5px]"}`} />
            </button>
          </div>
        </div>

        {open && (
          <ul id="menu-mobile" className="border-t border-white/10 px-2 pt-1 pb-2 md:hidden">
            {[...LINKS, status === "ready" ? ["Mon compte", "/compte"] : ["Connexion", "/connexion"]].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="display flex items-center justify-between rounded-2xl px-3 py-3.5 text-xl active:bg-white/[0.06]"
                >
                  {label}
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
