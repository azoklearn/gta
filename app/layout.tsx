import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gtaclip.io"),
  title: "GTAClip — Les lives GTA 6 des streamers, en shorts prêts à poster",
  description:
    "Colle le lien YouTube d'un streamer qui joue à GTA 6 : GTAClip repère les meilleurs moments et te livre des shorts verticaux titrés et sous-titrés, prêts à poster sur TikTok.",
  openGraph: {
    title: "GTAClip — Les lives GTA 6 des streamers, en shorts prêts à poster",
    description:
      "Colle un lien YouTube, récupère des shorts titrés, sous-titrés et prêts à poster sur TikTok, Reels et YouTube Shorts.",
    url: "https://gtaclip.io",
    siteName: "GTAClip",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
