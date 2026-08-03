import type { Metadata } from "next";
import { EB_Garamond, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alejandra Jimenez",
    template: "%s — Alejandra Jimenez",
  },
  description:
    "An immersive studio experience extending the artistic practice of Alejandra Jimenez.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen antialiased bg-bg text-ink">{children}</body>
    </html>
  );
}
