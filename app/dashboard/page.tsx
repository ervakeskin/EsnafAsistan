import { PageShell } from "@/components/dashboard/page-shell"

export default function DashboardPage() {
  return (
    <PageShell
      title="Dukkan Ozeti"
      description="Bugunku satis, stok durumu ve bekleyen teslimatlarin kisa ozeti."
      stats={[
        { label: "Bugunku Ciro", value: "24.750 TL", helper: "Dune gore +%9" },
        { label: "Dusuk Stok Uyarisi", value: "8 Urun", helper: "Acil siparis onerilir" },
        { label: "Bu Hafta Teslimat", value: "5 Kayit", helper: "Yarini bekleyen 2 teslimat var" },
      ]}
    />
  )
}
