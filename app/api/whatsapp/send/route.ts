import { NextResponse } from "next/server"
import { sendWhatsAppMessage, formatTurkishPhone, WHATSAPP_TEMPLATES } from "@/lib/integrations/whatsapp"

export async function POST(request: Request) {
  try {
    const { phone, template, parameters } = await request.json() as {
      phone?: string
      template?: string
      parameters?: Record<string, string>
    }

    if (!phone || !template || !parameters) {
      return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 })
    }

    const formattedPhone = formatTurkishPhone(phone)
    const templateDef = Object.values(WHATSAPP_TEMPLATES).find(t => t.name === template)

    if (!templateDef) {
      return NextResponse.json({ message: "Geçersiz şablon." }, { status: 400 })
    }

    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      templateName: template,
      parameters,
    })

    if (!result) {
      return NextResponse.json({ message: "WhatsApp API yapılandırılmamış." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result })
  } catch {
    return NextResponse.json({ message: "Mesaj gönderilemedi." }, { status: 500 })
  }
}
