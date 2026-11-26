import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { BookingProvider } from "@/components/BookingProvider";
import { TreatmentsMenuProvider } from "@/components/TreatmentsMenuProvider";

const montserrat = localFont({
  src: "../public/fonts/Montserrat-Latin.woff2",
  variable: "--font-montserrat",
  weight: "100 900",
  display: "swap",
});

const seasons = localFont({
  src: "../public/fonts/CormorantGaramond-Latin.woff2",
  weight: "400 700",
  variable: "--font-seasons",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aesthera Mère | Personalized Aesthetic Care",
  description: "Explore personalized aesthetic treatments, clinic services, and consultations at Aesthera Mère.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${seasons.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col"><BookingProvider><TreatmentsMenuProvider>{children}</TreatmentsMenuProvider></BookingProvider></body>
    </html>
  );
}
