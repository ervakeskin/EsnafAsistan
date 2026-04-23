import { PageShell } from "@/components/dashboard/page-shell"

export default function TeslimatlarPage() {
  return (
    <PageShell
      title="Teslimat Takvimi"
      description="Gelecek malları ve tedarikçi teslim tarihlerini tek ekranda planla."
      stats={[
        { label: "Yarın Gelecek Ürün", value: "23 Kalem", helper: "3 farklı tedarikçiden" },
        { label: "Geciken Teslimat", value: "2 Kayıt", helper: "Mail kontrolü gerekli" },
        { label: "Bu Ay Toplam Sevkiyat", value: "17", helper: "Geçen aya göre +4" },
      ]}
    />
  )
}
