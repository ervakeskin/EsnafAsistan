// WhatsApp Business API entegrasyonu
// Otomatik hatırlatma, sipariş teyidi ve fatura paylaşımı

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? ""
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? ""

type WhatsAppMessage = {
  to: string
  templateName: string
  parameters: Record<string, string>
}

export async function sendWhatsAppMessage(message: WhatsAppMessage) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.warn("[WhatsApp] API bilgileri tanımlı değil.")
    return null
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to,
          type: "template",
          template: {
            name: message.templateName,
            language: { code: "tr" },
            components: [
              {
                type: "body",
                parameters: Object.entries(message.parameters).map(
                  ([key, value]) => ({
                    type: "text",
                    text: value,
                  })
                ),
              },
            ],
          },
        }),
      }
    )

    return response.json()
  } catch (error) {
    console.error("[WhatsApp] Mesaj gönderilemedi:", error)
    return null
  }
}

export const WHATSAPP_TEMPLATES = {
  stockAlert: {
    name: "kritik_stok_uyarisi",
    parameters: ["product_name", "current_stock", "threshold"],
    message: (p: Record<string, string>) =>
      `⚠️ Kritik Stok Uyarısı!\nÜrün: ${p.product_name}\nMevcut: ${p.current_stock}\nEşik: ${p.threshold}`,
  },
  deliveryReminder: {
    name: "teslimat_hatirlatici",
    parameters: ["supplier_name", "product_name", "expected_date"],
    message: (p: Record<string, string>) =>
      `📦 Teslimat Hatırlatıcı\nTedarikçi: ${p.supplier_name}\nÜrün: ${p.product_name}\nTarih: ${p.expected_date}`,
  },
  paymentReminder: {
    name: "odeme_hatirlatici",
    parameters: ["customer_name", "amount", "due_date"],
    message: (p: Record<string, string>) =>
      `💰 Ödeme Hatırlatıcı\nMüşteri: ${p.customer_name}\nTutar: ${p.amount}\nSon Tarih: ${p.due_date}`,
  },
}

export function formatTurkishPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0")) return `90${digits.slice(1)}`
  if (digits.startsWith("90")) return digits
  return `90${digits}`
}
