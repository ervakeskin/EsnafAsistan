/**
 * app/api/ai/chat/route.ts
 * AI Chat API endpoint'i.
 * - Supabase'den güncel stok/kasa/teslimat verisi çeker (RAG bağlamı)
 * - Gemini 2.0 Flash'a gönderir
 * - Sadece oturum açmış kullanıcılar erişebilir
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { callGeminiAI, type AiMessage, type ShopContext } from "@/lib/ai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Auth kontrolü
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        { error: "AI servisi yapılandırılmamış. Lütfen GEMINI_API_KEY değerini .env.local dosyasına ekleyin." },
        { status: 503 },
      )
    }

    const body = await req.json()
    const messages: AiMessage[] = body.messages ?? []
    if (!messages.length) {
      return NextResponse.json({ error: "Mesaj listesi boş." }, { status: 400 })
    }

    // RAG: Supabase'den bağlam verileri paralel çek
    const today = new Date().toISOString().split("T")[0]

    const [
      { data: products },
      { data: recentSales },
      { data: todayCashflows },
      { data: deliveries },
      { data: settings },
    ] = await Promise.all([
      supabase.from("products").select("name, quantity, purchase_price"),
      supabase
        .from("products")
        .select("name, quantity, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase
        .from("cashflows")
        .select("type, amount")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`),
      supabase
        .from("deliveries")
        .select("id, status")
        .eq("status", "bekliyor"),
      supabase
        .from("settings")
        .select("shop_name")
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

    const productList = products ?? []
    const cashflowList = todayCashflows ?? []

    const lowStock = productList.filter((p) => (p.quantity ?? 0) <= 5)
    const totalValue = productList.reduce(
      (sum, p) => sum + (p.quantity ?? 0) * (p.purchase_price ?? 0),
      0,
    )
    const todayIncome = cashflowList
      .filter((c) => c.type === "gelir")
      .reduce((sum, c) => sum + (c.amount ?? 0), 0)
    const todayExpense = cashflowList
      .filter((c) => c.type === "gider")
      .reduce((sum, c) => sum + (c.amount ?? 0), 0)

    const context: ShopContext = {
      shopName: (settings as { shop_name?: string } | null)?.shop_name ?? undefined,
      criticalStockCount: lowStock.length,
      totalProducts: productList.length,
      totalWarehouseValue: totalValue,
      recentSales: (recentSales ?? []).slice(0, 5).map((p) => ({
        name: p.name ?? "",
        quantity: p.quantity ?? 0,
        date: p.updated_at ?? "",
      })),
      lowStockProducts: lowStock.map((p) => ({
        name: p.name ?? "",
        quantity: p.quantity ?? 0,
      })),
      todayIncome,
      todayExpense,
      pendingDeliveries: (deliveries ?? []).length,
    }

    const reply = await callGeminiAI(messages, context, apiKey)
    return NextResponse.json({ reply })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Bilinmeyen hata"
    console.error("[AI Chat] Hata:", msg)
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    )
  }
}
