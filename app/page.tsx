import { Earnings } from "@/components/Earnings";
import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Platforms } from "@/components/Platforms";
import { Pricing } from "@/components/Pricing";
import { ShortsWall } from "@/components/ShortsWall";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ShortsWall />
        <Platforms />
        <Features />
        <Earnings />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
