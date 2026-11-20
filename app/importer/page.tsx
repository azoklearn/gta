import type { Metadata } from "next";
import { Suspense } from "react";
import { ImportView } from "@/components/ImportView";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Envoyer ma vidéo — GTAClip", robots: { index: false } };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="relative isolate min-h-screen px-4 pt-32 pb-20 sm:px-6 sm:pt-40">
        <div className="glow absolute inset-x-0 top-0 -z-10 h-[34rem]" />
        <Suspense fallback={<p className="text-center text-ink-soft">Chargement…</p>}>
          <ImportView />
        </Suspense>
      </main>
    </>
  );
}
