import { PageShell } from "@/components/dashboard/page-shell"

export default function DashboardPage() {
  return (
    <PageShell
      title="Dükkan Özeti"
      description="Bugünkü satış, stok durumu ve bekleyen teslimatların kısa özeti."
      stats={[
        { label: "Bugünkü Ciro", value: "24.750 TL", helper: "Düne göre +%9" },
        { label: "Düşük Stok Uyarısı", value: "8 Ürün", helper: "Acil sipariş önerilir" },
        { label: "Bu Hafta Teslimat", value: "5 Kayıt", helper: "Yarını bekleyen 2 teslimat var" },
      ]}
    />
  )
}
