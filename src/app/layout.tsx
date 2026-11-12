import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Name Numerology Check — Free Chaldean Name Analysis",
  description:
    "Check if your name is aligned with your birth numbers using Chaldean numerology. Free instant analysis + detailed report options.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-b from-white via-maroon-50/30 to-white">
        {children}
      </body>
    </html>
  );
}
