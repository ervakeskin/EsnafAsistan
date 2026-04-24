import { DashboardCalendarWidget } from "@/components/dashboard/dashboard-calendar-widget"
import { PageShell } from "@/components/dashboard/page-shell"
import { RealtimeListener } from "@/components/dashboard/realtime-listener"
import { createClient } from "@/lib/supabase/server"

type ReminderRow = {
  id: string
  title: string
  note: string | null
  reminder_date: string
  category: string
  is_done: boolean
  priority: "dusuk" | "normal" | "yuksek"
  remind_at: string | null
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const [{ data: products }, { data: reminders }, { data: recentProducts }] = await Promise.all([
    supabase.from("products").select("id, quantity, purchase_price"),
    supabase
      .from("reminders")
      .select("id, title, note, reminder_date, category, is_done, priority, remind_at, created_at")
      .order("reminder_date", { ascending: true }),
    supabase.from("products").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
  ])

  const productRows = products ?? []
  const criticalStock = productRows.filter((item) => Number(item.quantity) <= 5).length
  const totalWarehouseValue = productRows.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.purchase_price),
    0,
  )
  const lastMovementsText =
    recentProducts && recentProducts.length > 0
      ? recentProducts.map((item) => item.name).join(", ")
      : "Henüz ürün hareketi bulunmuyor."

  return (
    <section className="space-y-6">
      <RealtimeListener
        channelName="dashboard-live-channel"
        tables={["products", "sales", "warehouses", "reminders"]}
      />

      <PageShell
        title="Dükkan Özeti"
        description="Stok, depolar ve günlük operasyonları tek ekrandan canlı takip et."
        stats={[
          {
            label: "Kritik Stok",
            value: `${criticalStock} ürün`,
            helper: "Stok miktarı 5 ve altındaki ürünler",
          },
          {
            label: "Son Hareketler",
            value: `${recentProducts?.length ?? 0} kayıt`,
            helper: lastMovementsText,
          },
          {
            label: "Toplam Depo Değeri",
            value: formatPrice(totalWarehouseValue),
            helper: "Miktar x alış fiyatı toplamı",
          },
        ]}
      />

      <DashboardCalendarWidget reminders={(reminders ?? []) as ReminderRow[]} />
    </section>
  )
}
