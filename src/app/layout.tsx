import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Astro Services — Name Numerology & Navagraha",
  description:
    "Free Chaldean name analysis and Navagraha planetary guide. Unlock corrected names and remedies via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
