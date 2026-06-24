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
  title: {
    default: "EsnafAsistan",
    template: "%s | EsnafAsistan",
  },
  description:
    "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi sağlayan web uygulaması.",
  keywords: ["esnaf", "stok takip", "kasa", "teslimat", "dükkan yönetimi", "raporlama"],
  applicationName: "EsnafAsistan",
  authors: [{ name: "EsnafAsistan" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
