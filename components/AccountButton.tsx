"use client";

import Link from "next/link";
import { useAccount } from "@/lib/account";

/** Bouton de la barre de navigation : « Essayer » pour un visiteur, accès au compte une fois connecté. */
export function AccountButton({ guestHref = "/#top", guestLabel = "Essayer" }: { guestHref?: string; guestLabel?: string }) {
  const { status, account } = useAccount();
  const signedIn = status === "ready" && account;

  return (
    <Link
      href={signedIn ? "/compte" : guestHref}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[14px] font-semibold whitespace-nowrap text-black transition hover:bg-white/90 active:translate-y-px"
    >
      {signedIn ? "Mon compte" : guestLabel}
      {signedIn && (
        <span className="grid h-6 min-w-6 place-items-center rounded-full bg-black px-1.5 text-[12px] font-bold tabular-nums text-white">
          {account.credits}
        </span>
      )}
    </Link>
  );
}
