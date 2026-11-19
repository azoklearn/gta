"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account";
import { ArrowRight } from "./Icons";

/** Bouton de la barre de navigation : « Essayer » pour un visiteur, accès au compte une fois connecté. */
export function AccountButton({ guestHref = "/#top", guestLabel = "Essayer" }: { guestHref?: string; guestLabel?: string }) {
  const { status, account } = useAccount();
  const signedIn = status === "ready" && account;

  return (
    <Link
      href={signedIn ? "/compte" : guestHref}
      className="group inline-flex h-11 items-center gap-2.5 rounded-[14px] bg-pink pl-4 pr-1.5 text-sm font-semibold tracking-tight text-white shadow-[0_10px_24px_-10px_rgb(255_46_139/0.9)] transition hover:brightness-105 active:scale-[0.98] max-[359px]:pr-4"
    >
      {signedIn ? "Mon compte" : guestLabel}
      <span className="grid h-8 min-w-8 place-items-center rounded-full bg-white px-2 text-ink transition group-hover:translate-x-0.5 max-[359px]:hidden">
        {signedIn ? <span className="text-[13px] font-bold tabular-nums">{account.credits}</span> : <ArrowRight className="h-4 w-4" />}
      </span>
    </Link>
  );
}
