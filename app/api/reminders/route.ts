import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type ReminderPayload = {
  title?: string
  note?: string
  reminderDate?: string
  category?: string
  priority?: "dusuk" | "normal" | "yuksek"
  remindAt?: string | null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("reminders")
      .select("id, title, note, reminder_date, category, is_done, priority, remind_at, created_at")
      .order("reminder_date", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ message: `Hatırlatmalar yüklenemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, reminders: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `Hatırlatmalar okunamadı: ${message}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReminderPayload
    const title = String(body.title ?? "").trim()
    const reminderDate = String(body.reminderDate ?? "").trim()
    const category = String(body.category ?? "Genel").trim() || "Genel"
    const note = String(body.note ?? "").trim()
    const priority = body.priority ?? "normal"
    const remindAt = body.remindAt ? String(body.remindAt) : null

    if (!title || !reminderDate) {
      return NextResponse.json({ message: "Başlık ve tarih zorunludur." }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("reminders").insert({
      title,
      note: note || null,
      reminder_date: reminderDate,
      category,
      priority,
      remind_at: remindAt,
      created_by: user?.id ?? null,
    })

    if (error) {
      return NextResponse.json({ message: `Hatırlatma eklenemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Hatırlatma başarıyla eklendi." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `Hatırlatma kaydedilemedi: ${message}` }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; isDone?: boolean }
    const id = String(body.id ?? "").trim()
    const isDone = body.isDone === true

    if (!id) {
      return NextResponse.json({ message: "Güncellenecek hatırlatma bulunamadı." }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("reminders").update({ is_done: isDone }).eq("id", id)

    if (error) {
      return NextResponse.json({ message: `Hatırlatma güncellenemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: isDone ? "Hatırlatma tamamlandı olarak işaretlendi." : "Hatırlatma tekrar aktif edildi.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `Hatırlatma güncellenemedi: ${message}` }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string }
    const id = String(body.id ?? "").trim()
    if (!id) {
      return NextResponse.json({ message: "Silinecek hatırlatma seçilmedi." }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("reminders").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ message: `Hatırlatma silinemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Hatırlatma silindi." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `Hatırlatma silinemedi: ${message}` }, { status: 500 })
  }
}
