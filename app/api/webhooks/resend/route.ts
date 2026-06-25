import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

type ResendInboundPayload = {
  from: string
  to: string[]
  subject?: string
  text?: string
  html?: string
  attachments?: { filename: string; content: string; contentType: string }[]
}

function parseSenderName(from: string): string {
  const match = from.match(/^([^<]+)</)
  return match?.[1]?.trim() || from.replace(/<[^>]+>/, "").trim() || from
}

function parseSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match?.[1]?.toLowerCase() || from.toLowerCase()
}

const LOG_PREFIX = "[Resend Webhook]"

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  const log = (msg: string, data?: unknown) => {
    const ts = new Date().toISOString()
    if (data) {
      console.log(`${LOG_PREFIX} [${ts}] [${requestId}] ${msg}`, data)
    } else {
      console.log(`${LOG_PREFIX} [${ts}] [${requestId}] ${msg}`)
    }
  }

  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      log(`Geçersiz Content-Type: ${contentType} (JSON bekleniyor)`)
      return NextResponse.json({ error: "Content-Type application/json olmalı" }, { status: 415 })
    }

    const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET
    if (expectedSecret) {
      const authHeader = request.headers.get("x-webhook-secret") ?? request.headers.get("authorization")?.replace("Bearer ", "")
      if (authHeader !== expectedSecret) {
        log("Yetkisiz webhook isteği — secret eşleşmedi")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const payload: ResendInboundPayload = await request.json()

    const senderName = parseSenderName(payload.from ?? "")
    const senderEmail = parseSenderEmail(payload.from ?? "")
    const subject = payload.subject ?? "(konu yok)"

    log(`Mail alındı: from="${senderName}" <${senderEmail}>, subject="${subject}"`)

    if (!senderName && !senderEmail) {
      log("Payload geçersiz: from alanı eksik", payload)
      return NextResponse.json({ error: "Geçersiz payload: from alanı eksik" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("deliveries").insert({
      supplier_name: senderName || senderEmail,
      linked_email: senderEmail,
      expected_date: new Date().toISOString().split("T")[0],
      quantity: 1,
      status: "işlenmeyi bekliyor",
    })

    if (error) {
      log(`DB ekleme hatası: ${error.message}`, { senderEmail, error })
      return NextResponse.json({ error: `Veritabanı hatası: ${error.message}` }, { status: 500 })
    }

    log(`Teslimat başarıyla eklendi: ${senderName} <${senderEmail}>`)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata"
    log(`Beklenmeyen hata: ${message}`, err instanceof Error ? { stack: err.stack } : undefined)
    return NextResponse.json({ error: `Beklenmeyen hata: ${message}` }, { status: 500 })
  }
}
