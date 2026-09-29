import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeSync Journal | Automated MetaTrader 4 & 5 Analytics",
  description:
    "Real-time automated trading journal & performance dashboard for MetaTrader 4 and 5 traders with Supabase backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#0B0E14] text-slate-100 selection:bg-blue-600/30 selection:text-blue-300">
        {children}
      </body>
    </html>
  );
}
