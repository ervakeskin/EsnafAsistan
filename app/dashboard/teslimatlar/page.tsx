import { PageShell } from "@/components/dashboard/page-shell"
import { createClient } from "@/lib/supabase/server"

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

function endOfWeek() {
  const date = new Date()
  const day = date.getDay()
  const diff = day === 0 ? 0 : 7 - day
  date.setDate(date.getDate() + diff)
  date.setHours(23, 59, 59, 999)
  return date.toISOString().slice(0, 10)
}

export default async function TeslimatlarPage() {
  const supabase = await createClient()
  const today = startOfToday()
  const weekEnd = endOfWeek()

  const [{ data: deliveries, error: deliveriesError }, { data: reminders, error: remindersError }] =
    await Promise.all([
      supabase.from("deliveries").select("id, expected_date, quantity, status"),
      supabase.from("reminders").select("id, reminder_date, is_done"),
    ])

  if (deliveriesError) {
    throw new Error(`Teslimat verileri yüklenemedi: ${deliveriesError.message}`)
  }

  if (remindersError) {
    throw new Error(`Hatırlatıcı verileri yüklenemedi: ${remindersError.message}`)
  }

  const deliveryRows = deliveries ?? []
  const reminderRows = reminders ?? []
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowIso = tomorrow.toISOString().slice(0, 10)

  const tomorrowCount = deliveryRows.filter((item) => item.expected_date === tomorrowIso).length
  const delayedCount = deliveryRows.filter(
    (item) => item.status === "bekliyor" && item.expected_date && item.expected_date < today,
  ).length
  const monthPlannedQuantity = deliveryRows.reduce((total, item) => total + Number(item.quantity ?? 0), 0)
  const weeklyReminderCount = reminderRows.filter(
    (item) =>
      item.is_done === false &&
      typeof item.reminder_date === "string" &&
      item.reminder_date >= today &&
      item.reminder_date <= weekEnd,
  ).length

  return (
    <PageShell
      title="Teslimat Takvimi"
      description="Gelecek malları ve tedarikçi teslim tarihlerini tek ekranda planla."
      stats={[
        {
          label: "Yarın Gelecek Teslimat",
          value: `${tomorrowCount} kayıt`,
          helper: "Yarın tarihli teslimat planı",
        },
        {
          label: "Geciken Teslimat",
          value: `${delayedCount} kayıt`,
          helper: "Bekliyor durumunda ve tarihi geçmiş teslimatlar",
        },
        {
          label: "Toplam Planlanan Miktar",
          value: `${monthPlannedQuantity} kalem`,
          helper: `Bu hafta ${weeklyReminderCount} aktif hatırlatıcı`,
        },
      ]}
    />
  )
}
