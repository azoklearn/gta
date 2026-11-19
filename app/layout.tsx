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
  title: "ViceClip — Les meilleurs moments des streamers GTA 6, en shorts prêts à poster",
  description:
    "Colle la vidéo d'un youtubeur ou d'un streamer GTA 6 : ViceClip repère les meilleurs moments et te livre des shorts verticaux sous-titrés, prêts à poster et optimisés pour devenir viraux sur TikTok.",
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
