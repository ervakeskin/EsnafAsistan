import { DashboardCalendarWidget } from "@/components/dashboard/dashboard-calendar-widget"
import { PageShell } from "@/components/dashboard/page-shell"
import { RealtimeListener } from "@/components/dashboard/realtime-listener"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

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

type ProductRow = {
  id: string
  quantity: number
  purchase_price: number
}

type RecentProductRow = {
  id: string
  name: string | null
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function DashboardPage() {
  let productRows: ProductRow[] = []
  let recentRows: RecentProductRow[] = []
  let reminderRows: ReminderRow[] = []

  try {
    const supabase = await createClient()
    const [
      { data: products, error: productsError },
      { data: reminders, error: remindersError },
      { data: recentProducts, error: recentProductsError },
    ] = await Promise.all([
      supabase.from("products").select("id, quantity, purchase_price"),
      supabase
        .from("reminders")
        .select("id, title, note, reminder_date, category, is_done, priority, remind_at, created_at")
        .order("reminder_date", { ascending: true }),
      supabase.from("products").select("id, name, created_at").order("created_at", { ascending: false }).limit(5),
    ])

    if (productsError || remindersError || recentProductsError) {
      console.error("Dashboard veri sorgusu uyarısı", {
        productsError: productsError?.message,
        remindersError: remindersError?.message,
        recentProductsError: recentProductsError?.message,
      })
    }

    productRows = (products ?? [])
      .filter((item) => Boolean(item && typeof item === "object"))
      .map((item) => ({
        id: String(item.id ?? ""),
        quantity: Number(item.quantity ?? 0),
        purchase_price: Number(item.purchase_price ?? 0),
      }))
      .filter((item) => item.id.length > 0)

    recentRows = (recentProducts ?? [])
      .filter((item) => Boolean(item && typeof item === "object"))
      .map((item) => {
        const row = item as { id?: unknown; name?: unknown }
        return {
          id: String(row.id ?? ""),
          name: typeof row.name === "string" ? row.name : null,
        }
      })
      .filter((item) => item.id.length > 0)
    reminderRows = (reminders ?? [])
      .filter((item) => Boolean(item && typeof item === "object"))
      .map((item) => {
        const row = item as {
          id?: unknown
          title?: unknown
          note?: unknown
          reminder_date?: unknown
          category?: unknown
          is_done?: unknown
          priority?: unknown
          remind_at?: unknown
        }
        const priorityCandidate = String(row.priority ?? "normal")
        return {
          id: String(row.id ?? ""),
          title: typeof row.title === "string" ? row.title : "",
          note: typeof row.note === "string" ? row.note : null,
          reminder_date: typeof row.reminder_date === "string" ? row.reminder_date : "",
          category: typeof row.category === "string" ? row.category : "Genel",
          is_done: Boolean(row.is_done),
          priority:
            priorityCandidate === "dusuk" || priorityCandidate === "yuksek" ? priorityCandidate : "normal",
          remind_at: typeof row.remind_at === "string" ? row.remind_at : null,
        } satisfies ReminderRow
      })
      .filter((item) => item.id.length > 0 && item.title.length > 0 && item.reminder_date.length > 0)
  } catch (error) {
    console.error("Dashboard render hatası:", error)
  }

  const criticalStock = productRows.filter((item) => item.quantity <= 5).length
  const totalWarehouseValue = productRows.reduce(
    (total, item) => total + item.quantity * item.purchase_price,
    0,
  )
  const lastMovementsText =
    recentRows.length > 0
      ? recentRows.map((item) => item.name ?? "İsimsiz ürün").join(", ")
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
            value: `${recentRows.length} kayıt`,
            helper: lastMovementsText,
          },
          {
            label: "Toplam Depo Değeri",
            value: formatPrice(totalWarehouseValue),
            helper: "Miktar x alış fiyatı toplamı",
          },
        ]}
      />

      <DashboardCalendarWidget reminders={reminderRows} />
    </section>
  )
}
