import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: {
    default: "Jyotish One — Your personal cosmic guide",
    template: "%s · Jyotish One",
  },
  description:
    "Your birth chart, name numerology and daily panchang in one thoughtful place. Begin with a free personal preview.",
  applicationName: "Jyotish One",
  keywords: [
    "name numerology",
    "chaldean numerology",
    "birth horoscope",
    "kundli",
    "panchang",
    "vedic astrology",
  ],
  openGraph: {
    title: "Jyotish One — Your personal cosmic guide",
    description:
      "Birth horoscope, name numerology and daily panchang. Start with a free personal preview.",
    type: "website",
    siteName: "Jyotish One",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0d19",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-ink-50 antialiased">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
