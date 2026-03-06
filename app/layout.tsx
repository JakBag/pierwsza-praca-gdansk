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
    default: "Pierwsza Praca Gdańsk",
    template: "%s | Pierwsza Praca Gdańsk",
  },
  description:
    "Oferty pracy dla studentów i osób bez doświadczenia. Pierwsza praca, praca dorywcza, na pół etatu i weekendowa w Trójmieście (Polska).",
  keywords: [
    "praca dla studentów",
    "praca bez doświadczenia",
    "pierwsza praca bez doświadczenia",
    "praca dorywcza dla studentów",
    "praca na pół etatu student",
    "praca weekendowa student",
    "praca dla studentów Polska",
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
