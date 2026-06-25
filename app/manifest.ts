import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EsnafAsistan",
    short_name: "EsnafAsistan",
    description: "Küçük işletmeler için stok, kasa, teslimat, raporlama ve hatırlatıcı yönetimi.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  }
}
