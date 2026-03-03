import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  title: {
    default: "Pierwsza Praca Gdansk",
    template: "%s | Pierwsza Praca Gdansk",
  },
  description:
    "Oferty pracy dla studentow i osob bez doswiadczenia. Pierwsza praca, praca dorywcza, na pol etatu i weekendowa w Trojmiescie (Polska).",
  keywords: [
    "praca dla studentow",
    "praca bez doswiadczenia",
    "pierwsza praca bez doswiadczenia",
    "praca dorywcza dla studentow",
    "praca na pol etatu student",
    "praca weekendowa student",
    "praca dla studentow Polska",
  ],
  appleWebApp: {
    capable: true,
    title: "Pierwsza Praca",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

  return (
    <html lang="pl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50`}>
        {measurementId ? (
          <Suspense fallback={null}>
            <GoogleAnalytics measurementId={measurementId} />
          </Suspense>
        ) : null}
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
