/**
 * lib/ai.ts
 * Gemini tabanlı AI altyapısı — RAG (Retrieval-Augmented Generation) ile
 * Supabase verilerini bağlam olarak AI'a gönderir.
 */

export type AiMessage = {
  role: "user" | "assistant"
  content: string
}

export type ShopContext = {
  shopName?: string
  criticalStockCount: number
  totalProducts: number
  totalWarehouseValue: number
  recentSales: Array<{ name: string; quantity: number; date: string }>
  lowStockProducts: Array<{ name: string; quantity: number }>
  todayIncome: number
  todayExpense: number
  pendingDeliveries: number
}

const SYSTEM_PROMPT = (ctx: ShopContext) => `
Sen EsnafAsistan'ın yapay zeka asistanısın. Türkiye'deki esnafa (küçük işletme sahiplerine) yardım ediyorsun.
${ctx.shopName ? `Dükkan adı: ${ctx.shopName}` : ""}

Güncel dükkan verileri (şu an itibarıyla):
- Toplam ürün sayısı: ${ctx.totalProducts}
- Kritik stok uyarısı olan ürün sayısı: ${ctx.criticalStockCount}
- Toplam depo değeri: ${ctx.totalWarehouseValue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
- Bugünkü gelir: ${ctx.todayIncome.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
- Bugünkü gider: ${ctx.todayExpense.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
- Bekleyen teslimat sayısı: ${ctx.pendingDeliveries}
${ctx.lowStockProducts.length > 0 ? `- Kritik stok ürünleri: ${ctx.lowStockProducts.map((p) => `${p.name} (${p.quantity} adet)`).join(", ")}` : ""}
${ctx.recentSales.length > 0 ? `- Son satışlar: ${ctx.recentSales.map((s) => `${s.name} (${s.quantity} adet)`).join(", ")}` : ""}

Kurallar:
- Her zaman Türkçe cevap ver.
- Kısa, net ve anlaşılır cevaplar ver. Gereksiz teknik terim kullanma.
- Esnafın anlayabileceği basit dil kullan.
- Sayısal verileri Türk lirası formatında göster.
- Eğer bir soruyu veriyle cevaplayabiliyorsan, kesinlikle veriye dayan.
- Eğer veri yoksa dürüstçe "Bu konuda yeterli verim yok" de.
`.trim()

export async function callGeminiAI(
  messages: AiMessage[],
  context: ShopContext,
  apiKey: string,
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT(context)

  // Gemini API: google/gemini-2.0-flash
  // gemini-2.0-flash-lite: ücretsiz quota'da çalışan en hızlı model
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`

  // Sistem promptunu ilk sıraya user mesajı olarak ekle (system_instruction yerine)
  // Bu yaklaşım tüm Gemini versiyonlarında çalışır
  const geminiContents = [
    {
      role: "user",
      parts: [{ text: `[SİSTEM TALİMATLARI]\n${systemPrompt}\n\n[KULLANICI MESAJI BAŞLIYOR]` }],
    },
    {
      role: "model",
      parts: [{ text: "Anladım. Verilen talimatlar doğrultusunda yardımcı olacağım." }],
    },
    ...messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  ]

  const body = {
    contents: geminiContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => "")
    let detail = ""
    try {
      const parsed = JSON.parse(err)
      detail = parsed?.error?.message ?? err
    } catch {
      detail = err
    }
    throw new Error(`Gemini API hatası (${response.status}): ${detail}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Gemini boş yanıt döndürdü.")
  return text
}

/**
 * Belirli bir mesajın AI kategorizasyon önerisi alır (ürün adından)
 */
export async function suggestCategory(
  productName: string,
  apiKey: string,
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Şu ürünün kategorisini tek kelimeyle tahmin et (Türkçe): "${productName}". 
            Sadece kategori adını yaz, başka bir şey ekleme. Örnekler: Gıda, İçecek, Temizlik, Kırtasiye, Elektronik, Giyim, Kozmetik, Oyuncak, Araç-Gereç.`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) return "Genel"
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "Genel"
}
