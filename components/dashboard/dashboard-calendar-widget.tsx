"use client"

import { FormEvent, useMemo, useState } from "react"
import { CalendarDays, LoaderCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusAlert } from "@/components/ui/status-alert"

type Reminder = {
  id: string
  title: string
  note: string | null
  reminder_date: string
  category: string
  is_done: boolean
  priority: "dusuk" | "normal" | "yuksek"
  remind_at: string | null
}

type Props = {
  reminders: Reminder[]
}

const PRIORITY_LABELS: Record<Reminder["priority"], string> = {
  dusuk: "Düşük",
  normal: "Normal",
  yuksek: "Yüksek",
}

export function DashboardCalendarWidget({ reminders }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  const normalizedReminders = useMemo(
    () =>
      reminders.filter(
        (item): item is Reminder =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.title === "string" &&
              typeof item.reminder_date === "string",
          ),
      ),
    [reminders],
  )

  const remindersOfDay = useMemo(
    () => normalizedReminders.filter((item) => item.reminder_date === selectedDate),
    [normalizedReminders, selectedDate],
  )

  async function handleCreateReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      note: String(formData.get("note") ?? "").trim(),
      reminderDate: selectedDate,
      category: String(formData.get("category") ?? "Genel").trim() || "Genel",
      priority: String(formData.get("priority") ?? "normal").trim(),
    }

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        setMessage({ type: "error", text: data?.message ?? "Hatırlatma eklenemedi." })
        return
      }

      setMessage({ type: "success", text: data?.message ?? "Hatırlatma eklendi." })
      event.currentTarget.reset()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? `İşlem başarısız: ${error.message}` : "Hatırlatma kaydedilemedi.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleReminderDone(id: string, isDone: boolean) {
    setMessage(null)
    try {
      const response = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDone: !isDone }),
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      setMessage({
        type: response.ok ? "success" : "error",
        text: data?.message ?? (response.ok ? "Durum güncellendi." : "Durum güncellenemedi."),
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? `Durum güncellenemedi: ${error.message}` : "Durum güncellenemedi.",
      })
    }
  }

  async function deleteReminder(id: string) {
    setMessage(null)
    try {
      const response = await fetch("/api/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = (await response.json().catch(() => null)) as { message?: string } | null
      setMessage({
        type: response.ok ? "success" : "error",
        text: data?.message ?? (response.ok ? "Hatırlatma silindi." : "Hatırlatma silinemedi."),
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? `Hatırlatma silinemedi: ${error.message}` : "Hatırlatma silinemedi.",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarDays className="size-5" />
          Takvim ve Hatırlatıcı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reminder-date" className="text-base">
            Gün Seç
          </Label>
          <Input
            id="reminder-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-12 text-base"
          />
        </div>

        <form className="space-y-3 rounded-lg border p-3" onSubmit={handleCreateReminder}>
          <Input name="title" required placeholder="Örn: Ödeme günü" className="h-11 text-base" />
          <Input name="note" placeholder="Kısa not (opsiyonel)" className="h-11 text-base" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              name="category"
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-base"
              defaultValue="Genel"
            >
              <option value="Genel">Genel</option>
              <option value="Odeme">Ödeme günü</option>
              <option value="Mal kabul">Mal kabul</option>
              <option value="Teslimat">Teslimat</option>
            </select>
            <select
              name="priority"
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-base"
              defaultValue="normal"
            >
              <option value="dusuk">Düşük</option>
              <option value="normal">Normal</option>
              <option value="yuksek">Yüksek</option>
            </select>
          </div>
          <Button type="submit" className="h-11 w-full text-base" disabled={isSaving}>
            {isSaving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Kaydediliyor
              </>
            ) : (
              "Hatırlatıcı Ekle"
            )}
          </Button>
        </form>

        {message ? (
          <StatusAlert
            message={message.text}
            variant={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"}
          />
        ) : null}

        <div className="space-y-2">
          <p className="text-base font-semibold">Seçili Gün Notları</p>
          {remindersOfDay.length === 0 ? (
            <p className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              Bu gün için kayıtlı hatırlatıcı yok.
            </p>
          ) : (
            remindersOfDay.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-600">
                      {item.category} - Öncelik: {PRIORITY_LABELS[item.priority] ?? "Normal"}
                    </p>
                    {item.note ? <p className="mt-1 text-sm text-slate-700">{item.note}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={item.is_done ? "outline" : "default"}
                      size="sm"
                      className="h-9"
                      onClick={() => toggleReminderDone(item.id, item.is_done)}
                    >
                      {item.is_done ? "Aktif Et" : "Tamamlandı"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="h-9 w-9"
                      onClick={() => deleteReminder(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
