import { CheckCircle2, Trash2, XCircle } from "lucide-react"

import { AddDeliveryDialog } from "@/components/dashboard/add-delivery-dialog"
import { PageShell } from "@/components/dashboard/page-shell"
import { RealtimeListener } from "@/components/dashboard/realtime-listener"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { createDeliveryAction } from "./actions"
import { DeliveryStatusForm, DeleteDeliveryForm } from "./form-client"

// Teslimat satırı tipi: liste tablosunda gösterilen alanlar
type DeliveryRow = {
  id: string
  supplier_name: string
  expected_date: string
  quantity: number
  status: "bekliyor" | "teslim-alindi" | "iptal"
  products: { name: string; unit: string }[] | null
}

// Durum kodunu kullanıcıya gösterilecek etiket ve renge çevirir
const STATUS_META: Record<DeliveryRow["status"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  bekliyor: { label: "Bekliyor", className: "bg-amber-100 text-amber-800", icon: XCircle },
  "teslim-alindi": { label: "Teslim Alındı", className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  iptal: { label: "İptal", className: "bg-red-100 text-red-700", icon: XCircle },
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value))
}

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

  const [
    { data: deliveries, error: deliveriesError },
    { data: reminders, error: remindersError },
    { data: products },
  ] = await Promise.all([
    supabase
      .from("deliveries")
      .select("id, supplier_name, expected_date, quantity, status, products(name, unit)")
      .order("expected_date", { ascending: true }),
    supabase.from("reminders").select("id, reminder_date, is_done"),
    supabase.from("products").select("id, name").order("name", { ascending: true }),
  ])

  if (deliveriesError) {
    console.error("Teslimat verileri yüklenemedi:", deliveriesError.message)
  }

  if (remindersError) {
    console.error("Hatırlatıcı verileri yüklenemedi:", remindersError.message)
  }

  const deliveryRows = (deliveries ?? []) as DeliveryRow[]
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
    <div className="space-y-6">
      <RealtimeListener channelName="teslimatlar" tables={["deliveries"]} />
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

      <div className="flex justify-end">
        <AddDeliveryDialog action={createDeliveryAction} products={products ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Teslimat Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Tedarikçi</TableHead>
                <TableHead className="text-base">Ürün</TableHead>
                <TableHead className="text-base">Beklenen Tarih</TableHead>
                <TableHead className="text-base">Miktar</TableHead>
                <TableHead className="text-base">Durum</TableHead>
                <TableHead className="text-base text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-base text-slate-500">
                    Henüz teslimat kaydı yok.
                  </TableCell>
                </TableRow>
              ) : (
                deliveryRows.map((delivery) => {
                  const statusMeta = STATUS_META[delivery.status] ?? STATUS_META.bekliyor
                  const productInfo = delivery.products?.[0]

                  return (
                    <TableRow key={delivery.id}>
                      <TableCell className="text-base font-semibold">{delivery.supplier_name}</TableCell>
                      <TableCell className="text-base">{productInfo?.name ?? "Genel sipariş"}</TableCell>
                      <TableCell className="text-base">{formatDate(delivery.expected_date)}</TableCell>
                      <TableCell className="text-base">
                        {delivery.quantity} {productInfo?.unit ?? "kalem"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusMeta.className}`}
                        >
                          <statusMeta.icon className="size-4" />
                          {statusMeta.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {/* Bekliyor durumundaysa teslim alındı / iptal seçenekleri */}
                          {delivery.status === "bekliyor" ? (
                            <>
                              <DeliveryStatusForm deliveryId={delivery.id} status="teslim-alindi" label="Teslim Al" />
                              <DeliveryStatusForm deliveryId={delivery.id} status="iptal" label="İptal" />
                            </>
                          ) : null}
                          <DeleteDeliveryForm deliveryId={delivery.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
