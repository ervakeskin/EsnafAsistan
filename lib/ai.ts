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

  // Vertex AI REST endpoint — Google Cloud API key (AQ. prefix) ile çalışır
  const projectId = process.env.GOOGLE_PROJECT_ID ?? "esnaf-asistan-500520"
  const location = "us-central1"
  const model = "gemini-1.5-flash"
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`

  const geminiContents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }))

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
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
  const projectId = process.env.GOOGLE_PROJECT_ID ?? "esnaf-asistan-500520"
  const location = "us-central1"
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-flash:generateContent`

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
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) return "Genel"
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "Genel"
}

/**
 * Gelen sipariş veya fatura e-postasından teslimat detaylarını (ürün adı, adet, toptancı adı vb.) AI ile çıkartır.
 */
export async function parseDeliveryEmailWithAI(
  subject: string,
  bodyText: string,
  apiKey: string,
): Promise<{
  supplierName?: string
  productName?: string
  quantity?: number
  notes?: string
  expectedDate?: string
}> {
  const projectId = process.env.GOOGLE_PROJECT_ID ?? "esnaf-asistan-500520"
  const location = "us-central1"
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-flash:generateContent`

  const prompt = `
Aşağıda bir toptancıdan gelen sipariş veya fatura e-postasının konusu ve içeriği verilmiştir. 
Bu e-postadan teslimat bilgilerini çıkarıp, SADECE geçerli bir JSON objesi olarak geri döndür. 
Hiçbir açıklama, markdown işareti (\`\`\`json vb.) veya ek metin ekleme. Sadece saf JSON string döndür.

Döndüreceğin JSON yapısı şu şekilde olmalıdır:
{
  "supplierName": "Toptancı/Satıcı Adı (eğer e-postadan anlaşılıyorsa, örn: Ülker, Sütaş, Metro Toptancı, yoksa boş bırak)",
  "productName": "Siparişteki ana ürün adı veya ürünlerin özeti (örn: '10 Koli Süt ve 5 Paket Bisküvi', veya 'Karışık Gıda Malzemesi')",
  "quantity": Toplam teslim alınacak koli/paket/ürün adedi (sayı olmalı, tam sayı olarak tahmin et, en az 1)",
  "expectedDate": "Tahmini teslimat tarihi (YYYY-MM-DD formatında. Eğer e-postada teslimat tarihi geçiyorsa onu yaz, geçmiyorsa bugünün tarihi olan '${new Date().toISOString().split("T")[0]}' yaz)",
  "notes": "E-postadan çıkarılan önemli notlar, fatura no veya detaylar (isteğe bağlı)"
}

E-posta Konusu: ${subject}
E-posta İçeriği:
${bodyText.slice(0, 4000)}
`

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 500,
    },
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return {}
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) return {}

    // Markdown \`\`\`json ve \`\`\` bloklarını temizle
    const cleanText = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim()
    const parsed = JSON.parse(cleanText)
    return {
      supplierName: parsed.supplierName || undefined,
      productName: parsed.productName || undefined,
      quantity: typeof parsed.quantity === "number" ? parsed.quantity : undefined,
      notes: parsed.notes || undefined,
      expectedDate: parsed.expectedDate || undefined,
    }
  } catch (e) {
    console.error("[AI Email Parser] Hata:", e)
    return {}
  }
}
