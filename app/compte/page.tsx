import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/AccountView";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Mon compte — GTAClip", robots: { index: false } };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="relative isolate min-h-screen px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div className="glow absolute inset-x-0 top-0 -z-10 h-[34rem]" />
        <Suspense fallback={<p className="text-center text-ink-soft">Chargement de ton compte…</p>}>
          <AccountView />
        </Suspense>
      </main>
    </>
  );
}
