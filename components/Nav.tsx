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
        className={`mx-auto max-w-[900px] rounded-2xl border border-black/5 shadow-card backdrop-blur-xl transition-colors ${
          open ? "bg-white" : "bg-white/90"
        }`}
      >
        <div className="flex h-16 items-center justify-between pl-4 pr-2.5 sm:pl-5">
          <a href="#top" aria-label="ViceClip, retour en haut" onClick={() => setOpen(false)}>
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
          <div className="flex items-center gap-2">
            {status === "guest" && (
              <Link href="/connexion" className="hidden px-2 text-[15px] font-semibold text-body transition hover:text-ink sm:block">
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
              className="relative grid h-11 w-11 place-items-center rounded-[14px] border border-black/10 text-ink transition active:scale-95 md:hidden"
            >
              <span
                className={`absolute h-0.5 w-[18px] rounded-full bg-current transition ${open ? "rotate-45" : "-translate-y-[4px]"}`}
              />
              <span
                className={`absolute h-0.5 w-[18px] rounded-full bg-current transition ${open ? "-rotate-45" : "translate-y-[4px]"}`}
              />
            </button>
          </div>
        </div>

        {open && (
          <ul id="menu-mobile" className="border-t border-black/5 px-2 pb-2 pt-1 md:hidden">
            {[...LINKS, status === "ready" ? ["Mon compte", "/compte"] : ["Connexion", "/connexion"]].map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="display flex items-center justify-between rounded-xl px-3 py-3.5 text-xl active:bg-paper"
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
