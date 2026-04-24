import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type OcrItem = {
  name: string
  quantity: number
  unit: string
  purchasePrice: number
}

type OcrPayload = {
  warehouseId?: string
  items?: OcrItem[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OcrPayload
    const warehouseId = body.warehouseId?.trim()
    const items = body.items ?? []

    if (!warehouseId) {
      return NextResponse.json({ message: "Depo seçimi zorunludur." }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Fotoğraftan okunan liste boş." }, { status: 400 })
    }

    const sanitizedItems = items
      .map((item) => ({
        name: String(item.name ?? "").trim(),
        quantity: Number(item.quantity ?? 0),
        unit: String(item.unit ?? "").trim() || "Adet",
        purchasePrice: Number(item.purchasePrice ?? 0),
      }))
      .filter((item) => item.name.length > 0 && Number.isFinite(item.quantity) && item.quantity > 0)

    if (sanitizedItems.length === 0) {
      return NextResponse.json({ message: "Geçerli ürün satırı bulunamadı." }, { status: 400 })
    }

    if (sanitizedItems.some((item) => !Number.isFinite(item.purchasePrice) || item.purchasePrice < 0)) {
      return NextResponse.json(
        { message: "Tüm satırlarda birim fiyat sıfır veya daha büyük olmalıdır." },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { data: warehouse, error: warehouseError } = await supabase
      .from("warehouses")
      .select("id, name, is_active")
      .eq("id", warehouseId)
      .single()

    if (warehouseError || !warehouse) {
      return NextResponse.json({ message: "Seçilen depo bulunamadı." }, { status: 404 })
    }

    if (!warehouse.is_active) {
      return NextResponse.json({ message: "Pasif depoya toplu ürün eklenemez." }, { status: 400 })
    }

    let insertedCount = 0
    let updatedCount = 0

    for (const item of sanitizedItems) {
      const { data: existing } = await supabase
        .from("products")
        .select("id, quantity")
        .eq("warehouse_id", warehouse.id)
        .ilike("name", item.name)
        .limit(1)
        .maybeSingle()

      if (existing) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ quantity: Number(existing.quantity) + item.quantity, purchase_price: item.purchasePrice, unit: item.unit })
          .eq("id", existing.id)

        if (updateError) {
          return NextResponse.json(
            { message: `Mevcut ürün güncellenemedi (${item.name}): ${updateError.message}` },
            { status: 500 },
          )
        }

        updatedCount += 1
        continue
      }

      const { error: insertError } = await supabase.from("products").insert({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchase_price: item.purchasePrice,
        warehouse_id: warehouse.id,
        warehouse: warehouse.name,
      })

      if (insertError) {
        return NextResponse.json(
          { message: `Yeni ürün kaydedilemedi (${item.name}): ${insertError.message}` },
          { status: 500 },
        )
      }

      insertedCount += 1
    }

    return NextResponse.json({
      ok: true,
      message: `OCR işlemi tamamlandı. ${insertedCount} yeni ürün eklendi, ${updatedCount} ürün güncellendi.`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `OCR içe aktarma başarısız: ${message}` }, { status: 500 })
  }
}
