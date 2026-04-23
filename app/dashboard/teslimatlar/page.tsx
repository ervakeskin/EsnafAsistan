import { PageShell } from "@/components/dashboard/page-shell"

export default function TeslimatlarPage() {
  return (
    <PageShell
      title="Teslimat Takvimi"
      description="Gelecek mallari ve tedarikci teslim tarihlerini tek ekranda planla."
      stats={[
        { label: "Yarin Gelecek Urun", value: "23 Kalem", helper: "3 farkli tedarikciden" },
        { label: "Geciken Teslimat", value: "2 Kayit", helper: "Mail kontrolu gerekli" },
        { label: "Bu Ay Toplam Sevkiyat", value: "17", helper: "Gecen aya gore +4" },
      ]}
    />
  )
}
