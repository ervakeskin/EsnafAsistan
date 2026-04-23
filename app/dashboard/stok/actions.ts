"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

const validWarehouses = ["Dukkan", "Ana Depo", "Arac"] as const

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const quantity = Number(formData.get("quantity") ?? 0)
  const unit = String(formData.get("unit") ?? "").trim()
  const purchasePrice = Number(formData.get("purchase_price") ?? 0)
  const warehouse = String(formData.get("warehouse") ?? "Ana Depo").trim()

  if (!name || !unit) {
    throw new Error("Urun adi ve birim zorunludur.")
  }

  if (quantity < 0 || purchasePrice <= 0) {
    throw new Error("Miktar veya alis fiyati gecersiz.")
  }

  if (!validWarehouses.includes(warehouse as (typeof validWarehouses)[number])) {
    throw new Error("Depo konumu gecersiz.")
  }

  const supabase = await createClient()

  const { error } = await supabase.from("products").insert({
    name,
    quantity,
    unit,
    purchase_price: purchasePrice,
    warehouse,
  })

  if (error) {
    throw new Error(`Urun eklenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/stok")
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) {
    throw new Error("Silinecek urun bilgisi bulunamadi.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    throw new Error(`Urun silinemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/stok")
}

export async function createSaleAction(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "").trim()
  const rawQuantity = String(formData.get("quantity") ?? "").trim()
  const rawSalePrice = String(formData.get("sale_price") ?? "").trim()
  const quantity = Number(rawQuantity)
  const salePrice = Number(rawSalePrice)
  const customerName = String(formData.get("customer_name") ?? "").trim()
  const note = String(formData.get("note") ?? "").trim()

  if (!productId) {
    throw new Error("Satis icin urun secimi bulunamadi.")
  }

  if (!rawQuantity) {
    throw new Error("Satis miktari bos birakilamaz.")
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Satis miktari 1 veya daha buyuk bir tam sayi olmali.")
  }

  if (!rawSalePrice) {
    throw new Error("Satis fiyati bos birakilamaz.")
  }

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    throw new Error("Satis fiyati sifirdan buyuk olmali.")
  }

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, quantity, purchase_price")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    throw new Error(`Urun bilgisi okunamadi: ${productError?.message ?? "Kayit bulunamadi."}`)
  }

  const currentQuantity = Number(product.quantity)
  const purchasePrice = Number(product.purchase_price)

  if (currentQuantity < quantity) {
    throw new Error(
      `Stok yetersiz. Stokta ${currentQuantity} urun var, ${quantity} adet satis yapilamaz.`,
    )
  }

  const newQuantity = currentQuantity - quantity

  const { data: updatedStockRow, error: stockUpdateError } = await supabase
    .from("products")
    .update({ quantity: newQuantity })
    .eq("id", productId)
    .eq("quantity", currentQuantity)
    .select("id")
    .maybeSingle()

  if (stockUpdateError) {
    throw new Error(`Stok guncellenemedi: ${stockUpdateError.message}`)
  }

  if (!updatedStockRow) {
    throw new Error("Stok degisti. Lutfen sayfayi yenileyip tekrar deneyin.")
  }

  const { error: saleInsertError } = await supabase.from("sales").insert({
    product_id: productId,
    quantity,
    sale_price: salePrice,
    purchase_price: purchasePrice,
    customer_name: customerName || null,
    note: note || null,
  })

  if (saleInsertError) {
    await supabase.from("products").update({ quantity: currentQuantity }).eq("id", productId)
    throw new Error(`Satis kaydi olusturulamadi: ${saleInsertError.message}`)
  }

  revalidatePath("/dashboard/stok")
  revalidatePath("/dashboard/kasa")
}
