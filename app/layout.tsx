import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  metadataBase: new URL("https://esnafasistan.vercel.app"),
  title: {
    default: "EsnafAsistan",
    template: "%s | EsnafAsistan",
  },
  description:
    "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi sağlayan web uygulaması.",
  keywords: ["esnaf", "stok takip", "kasa", "teslimat", "dükkan yönetimi", "raporlama"],
  applicationName: "EsnafAsistan",
  authors: [{ name: "EsnafAsistan" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "EsnafAsistan",
    title: "EsnafAsistan — Dükkan Yönetim Paneli",
    description:
      "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi sağlayan web uygulaması.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EsnafAsistan — Dükkan Yönetim Paneli",
    description:
      "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi sağlayan web uygulaması.",
  },
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
