import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EsnafAsistan — Dükkan Yönetim Paneli",
    short_name: "EsnafAsistan",
    description: "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    lang: "tr-TR",
    dir: "ltr",
    prefer_related_applications: false,
    scope: "/",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  }
}
