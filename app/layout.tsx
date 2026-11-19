import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Inter } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViceClip — Transforme tes vidéos GTA 6 en shorts TikTok qui paient",
  description:
    "Colle un lien YouTube : ViceClip découpe n'importe quelle vidéo GTA 6 en shorts verticaux prêts à poster sur TikTok, avec sous-titres, recadrage 9:16 et score de viralité.",
};

export const viewport: Viewport = {
  themeColor: "#f7f6f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${instrument.variable} ${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
