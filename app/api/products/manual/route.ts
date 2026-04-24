import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const name = String(formData.get("name") ?? "").trim()
    const unit = String(formData.get("unit") ?? "").trim()
    const warehouseId = String(formData.get("warehouse_id") ?? "").trim()
    const quantity = Number(formData.get("quantity") ?? 0)
    const purchasePrice = Number(formData.get("purchase_price") ?? 0)
    const photo = formData.get("photo")

    if (!name || !unit || !warehouseId) {
      return NextResponse.json({ message: "Mal adı, birim ve depo seçimi zorunludur." }, { status: 400 })
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json({ message: "Stok miktarı geçersiz." }, { status: 400 })
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
      return NextResponse.json({ message: "Birim fiyat sıfırdan büyük olmalıdır." }, { status: 400 })
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
      return NextResponse.json({ message: "Pasif depoya ürün ekleyemezsin." }, { status: 400 })
    }

    let uploadedPhotoPath: string | null = null

    if (photo instanceof File && photo.size > 0) {
      const safeName = photo.name.replace(/\s+/g, "-").toLowerCase()
      const filePath = `item-photos/${Date.now()}-${safeName}`
      const fileBuffer = Buffer.from(await photo.arrayBuffer())
      const { error: uploadError } = await supabase.storage.from("item-photos").upload(filePath, fileBuffer, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
      })

      if (uploadError) {
        return NextResponse.json(
          { message: `Fotoğraf yüklenemedi. Storage ayarını kontrol et: ${uploadError.message}` },
          { status: 500 },
        )
      }

      uploadedPhotoPath = filePath
    }

    const { error: insertError } = await supabase.from("products").insert({
      name,
      quantity,
      unit,
      purchase_price: purchasePrice,
      warehouse_id: warehouse.id,
      warehouse: warehouse.name,
    })

    if (insertError) {
      return NextResponse.json({ message: `Mal kaydedilemedi: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: uploadedPhotoPath
        ? "Mal ve fotoğraf başarıyla eklendi."
        : "Mal başarıyla eklendi. Fotoğraf yüklenmedi.",
      photoPath: uploadedPhotoPath,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
    return NextResponse.json({ message: `Mal ekleme işlemi tamamlanamadı: ${message}` }, { status: 500 })
  }
}
