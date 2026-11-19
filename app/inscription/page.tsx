import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Créer un compte — ViceClip", robots: { index: false } };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="relative isolate min-h-screen px-4 pb-20 pt-32 sm:pt-40">
        <div className="sky absolute inset-x-0 top-0 -z-10 h-[30rem] opacity-70" />
        <AuthForm mode="signup" />
      </main>
    </>
  );
}
