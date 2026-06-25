import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

type ResendEventPayload = {
  type: "email.sent" | "email.delivered" | "email.delivery_delayed" | "email.complained" | "email.bounced" | "email.failed" | "email.clicked" | "email.opened"
  created_at: string
  data: Record<string, unknown>
}

type ResendInboundPayload = {
  from: string
  to: string[]
  subject?: string
  text?: string
  html?: string
  attachments?: { filename: string; content: string; contentType: string }[]
}

const LOG_PREFIX = "[Resend Webhook]"

function log(requestId: string, msg: string, data?: unknown) {
  const ts = new Date().toISOString()
  if (data) {
    console.log(`${LOG_PREFIX} [${ts}] [${requestId}] ${msg}`, data)
  } else {
    console.log(`${LOG_PREFIX} [${ts}] [${requestId}] ${msg}`)
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): Promise<boolean> {
  if (!signatureHeader) {
    return false
  }

  const signatures = signatureHeader
    .split(" ")
    .flatMap((part) => part.split(","))
    .map((s) => s.trim())

  for (const entry of signatures) {
    const parts = entry.split("=")
    if (parts.length === 2 && parts[0] === "v1") {
      const expectedSig = parts[1]
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody))
      const sigHex = Array.from(new Uint8Array(sigBytes)).map((b) => b.toString(16).padStart(2, "0")).join("")
      if (timingSafeEqual(sigHex, expectedSig)) {
        return true
      }
    }
  }

  return false
}

function parseSenderName(from: string): string {
  const match = from.match(/^([^<]+)</)
  return match?.[1]?.trim() || from.replace(/<[^>]+>/, "").trim() || from
}

function parseSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/)
  return match?.[1]?.toLowerCase() || from.toLowerCase()
}

async function handleEvent(payload: ResendEventPayload, requestId: string) {
  const { type, data } = payload
  const emailId = String(data?.email_id ?? "bilinmiyor")

  log(requestId, `Olay alındı: ${type}`, { emailId, data })

  switch (type) {
    case "email.sent":
      log(requestId, `E-posta gönderildi: ${emailId}`)
      break

    case "email.delivered":
      log(requestId, `E-posta teslim edildi: ${emailId}`)
      break

    case "email.failed":
    case "email.bounced":
      const errorMsg = data?.bounce ? String(data?.bounce) : String(data?.error ?? "bilinmeyen hata")
      log(requestId, `E-posta başarısız: ${emailId}`, { error: errorMsg })
      break

    case "email.clicked":
      const clickUrl = String(data?.url ?? "url yok")
      log(requestId, `E-posta bağlantısı tıklandı: ${emailId}`, { url: clickUrl })
      break

    case "email.opened":
      log(requestId, `E-posta açıldı: ${emailId}`)
      break

    default:
      log(requestId, `Bilinmeyen olay türü: ${type}`, { data })
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)

  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      log(requestId, `Geçersiz Content-Type: ${contentType} (JSON bekleniyor)`)
      return NextResponse.json({ error: "Content-Type application/json olmalı" }, { status: 415 })
    }

    const rawBody = await request.text()

    const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET
    if (expectedSecret) {
      const signatureHeader = request.headers.get("x-resend-signature") ?? request.headers.get("x-webhook-secret") ?? request.headers.get("authorization")?.replace("Bearer ", "")

      if (!signatureHeader || !(await verifySignature(rawBody, signatureHeader, expectedSecret))) {
        const authHeaderOnly = request.headers.get("x-webhook-secret") ?? request.headers.get("authorization")?.replace("Bearer ", "")
        if (authHeaderOnly !== expectedSecret) {
          log(requestId, "Yetkisiz webhook isteği — imza doğrulanamadı")
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
      }
    }

    const payload = JSON.parse(rawBody)

    if (payload.type && typeof payload.type === "string" && payload.type.startsWith("email.")) {
      await handleEvent(payload as ResendEventPayload, requestId)
      return NextResponse.json({ ok: true })
    }

    const inbound = payload as ResendInboundPayload
    const senderName = parseSenderName(inbound.from ?? "")
    const senderEmail = parseSenderEmail(inbound.from ?? "")
    const subject = inbound.subject ?? "(konu yok)"

    log(requestId, `Mail alındı: from="${senderName}" <${senderEmail}>, subject="${subject}"`)

    if (!senderName && !senderEmail) {
      log(requestId, "Payload geçersiz: from alanı eksik", inbound)
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
      log(requestId, `DB ekleme hatası: ${error.message}`, { senderEmail, error })
      return NextResponse.json({ error: `Veritabanı hatası: ${error.message}` }, { status: 500 })
    }

    log(requestId, `Teslimat başarıyla eklendi: ${senderName} <${senderEmail}>`)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata"
    log(requestId, `Beklenmeyen hata: ${message}`, err instanceof Error ? { stack: err.stack } : undefined)
    return NextResponse.json({ error: `Beklenmeyen hata: ${message}` }, { status: 500 })
  }
}
