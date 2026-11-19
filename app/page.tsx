import { Earnings } from "@/components/Earnings";
import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Pricing } from "@/components/Pricing";
import { Steps } from "@/components/Steps";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Steps />
        <Earnings />
        <Features />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
