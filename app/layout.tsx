import type { Metadata, Viewport } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ViceClip — Transforme tes vidéos GTA 6 en shorts TikTok qui paient",
  description:
    "Colle un lien YouTube : ViceClip découpe n'importe quelle vidéo GTA 6 en shorts verticaux prêts à poster sur TikTok, avec sous-titres, recadrage 9:16 et score de viralité.",
};

export const viewport: Viewport = {
  themeColor: "#0a0612",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${anton.variable} ${manrope.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
