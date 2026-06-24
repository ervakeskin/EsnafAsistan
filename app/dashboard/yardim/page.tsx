import { AlertTriangle, Lightbulb, Sparkles, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

// Eşik altı sayılacak kritik stok seviyesi (raporlar ile aynı)
const CRITICAL_STOCK_THRESHOLD = 5

type Suggestion = {
  icon: typeof Lightbulb
  tone: "info" | "warning" | "success"
  title: string
  detail: string
}

const TONE_STYLES: Record<Suggestion["tone"], string> = {
  info: "border-l-blue-400",
  warning: "border-l-amber-400",
  success: "border-l-emerald-400",
}

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export default async function YardimPage() {
  const supabase = await createClient()

  // Basit kural tabanlı öneri motoru: gerçek verilere bakarak ipucu üretir
  const [{ data: products }, { data: sales }, { data: deliveries }] = await Promise.all([
    supabase.from("products").select("name, quantity"),
    supabase.from("sales").select("quantity, sale_price, purchase_price").gte("sold_at", isoDaysAgo(7)),
    supabase.from("deliveries").select("status, expected_date"),
  ])

  const productRows = products ?? []
  const saleRows = sales ?? []
  const deliveryRows = deliveries ?? []

  const today = new Date().toISOString().slice(0, 10)
  const criticalCount = productRows.filter((p) => Number(p.quantity) <= CRITICAL_STOCK_THRESHOLD).length
  const weeklyProfit = saleRows.reduce(
    (sum, s) => sum + (Number(s.sale_price) - Number(s.purchase_price)) * Number(s.quantity),
    0,
  )
  const delayedCount = deliveryRows.filter(
    (d) => d.status === "bekliyor" && d.expected_date && d.expected_date < today,
  ).length

  const suggestions: Suggestion[] = []

  if (criticalCount > 0) {
    suggestions.push({
      icon: AlertTriangle,
      tone: "warning",
      title: `${criticalCount} ürün kritik stok seviyesinde`,
      detail:
        "Raporlar sayfasından kritik stok listesini kontrol et ve tükenmeden önce tedarikçine sipariş ver.",
    })
  }

  if (delayedCount > 0) {
    suggestions.push({
      icon: AlertTriangle,
      tone: "warning",
      title: `${delayedCount} teslimat gecikmiş durumda`,
      detail: "Teslimat Takvimi sayfasından geciken siparişleri tedarikçilerinle görüş.",
    })
  }

  if (weeklyProfit > 0) {
    suggestions.push({
      icon: TrendingUp,
      tone: "success",
      title: "Bu hafta kâr ediyorsun",
      detail:
        "En çok satan ürünlerini Raporlar sayfasından takip et; stoklarını bu ürünlere göre planla.",
    })
  } else if (saleRows.length === 0) {
    suggestions.push({
      icon: Lightbulb,
      tone: "info",
      title: "Henüz satış kaydın yok",
      detail: "Kasa sayfasından ilk satışını ekleyerek kâr takibini başlatabilirsin.",
    })
  }

  // Her zaman gösterilen genel ipuçları
  const staticTips: Suggestion[] = [
    {
      icon: Lightbulb,
      tone: "info",
      title: "Fotoğrafla hızlı ürün girişi",
      detail: "Stok sayfasında ürün fotoğrafı çekerek veya liste fotoğrafından OCR ile toplu giriş yapabilirsin.",
    },
    {
      icon: Lightbulb,
      tone: "info",
      title: "Hatırlatıcıları kullan",
      detail: "Ödeme günü, mal kabul gibi önemli tarihleri takvim widget'ından hatırlatıcı olarak ekle.",
    },
    {
      icon: Lightbulb,
      tone: "info",
      title: "Depolarını ayır",
      detail: "Dükkan, ana depo ve araç stoklarını ayrı takip ederek nerede ne kaldığını net gör.",
    },
  ]

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Yardım ve Öneriler</h1>
        <p className="mt-2 text-base text-slate-600">
          Verilerine göre hazırlanan akıllı ipuçları ve uygulamayı verimli kullanma rehberi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-violet-500" />
            Sana Özel Öneriler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="rounded-lg border bg-slate-50 p-3 text-base text-slate-600">
              Şu an her şey yolunda görünüyor. 👍
            </p>
          ) : (
            suggestions.map((item, index) => (
              <div
                key={index}
                className={`rounded-lg border border-l-4 bg-white p-3 ${TONE_STYLES[item.tone]}`}
              >
                <p className="flex items-center gap-2 text-base font-semibold">
                  <item.icon className="size-4" />
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Uygulama İpuçları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {staticTips.map((item, index) => (
            <div key={index} className={`rounded-lg border border-l-4 bg-white p-3 ${TONE_STYLES[item.tone]}`}>
              <p className="flex items-center gap-2 text-base font-semibold">
                <item.icon className="size-4" />
                {item.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
