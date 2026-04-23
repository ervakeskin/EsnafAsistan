"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const quantity = Number(formData.get("quantity") ?? 0)
  const unit = String(formData.get("unit") ?? "").trim()
  const purchasePrice = Number(formData.get("purchase_price") ?? 0)
  const warehouseId = String(formData.get("warehouse_id") ?? "").trim()

  if (!name || !unit) {
    throw new Error("Ürün adı ve birim zorunludur.")
  }

  if (quantity < 0 || purchasePrice <= 0) {
    throw new Error("Miktar veya alış fiyatı geçersiz.")
  }

  if (!warehouseId) {
    throw new Error("Depo seçimi zorunludur.")
  }

  const supabase = await createClient()

  const { data: selectedWarehouse, error: warehouseError } = await supabase
    .from("warehouses")
    .select("id, name, is_active")
    .eq("id", warehouseId)
    .single()

  if (warehouseError || !selectedWarehouse) {
    throw new Error("Seçilen depo bulunamadı.")
  }

  if (!selectedWarehouse.is_active) {
    throw new Error("Pasif depoya ürün eklenemez.")
  }

  const { error } = await supabase.from("products").insert({
    name,
    quantity,
    unit,
    purchase_price: purchasePrice,
    warehouse: selectedWarehouse.name,
    warehouse_id: selectedWarehouse.id,
  })

  if (error) {
    throw new Error(`Ürün eklenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/stok")
  revalidatePath("/dashboard/ayarlar")
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) {
    throw new Error("Silinecek ürün bilgisi bulunamadı.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    throw new Error(`Ürün silinemedi: ${error.message}`)
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
    throw new Error("Satış için ürün seçimi bulunamadı.")
  }

  if (!rawQuantity) {
    throw new Error("Satış miktarı boş bırakılamaz.")
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Satış miktarı 1 veya daha büyük bir tam sayı olmalı.")
  }

  if (!rawSalePrice) {
    throw new Error("Satış fiyatı boş bırakılamaz.")
  }

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    throw new Error("Satış fiyatı sıfırdan büyük olmalı.")
  }

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, quantity, purchase_price")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    throw new Error(`Ürün bilgisi okunamadı: ${productError?.message ?? "Kayıt bulunamadı."}`)
  }

  const currentQuantity = Number(product.quantity)
  const purchasePrice = Number(product.purchase_price)

  if (currentQuantity < quantity) {
    throw new Error(
      `Stok yetersiz. Stokta ${currentQuantity} ürün var, ${quantity} adet satış yapılamaz.`,
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
    throw new Error(`Stok güncellenemedi: ${stockUpdateError.message}`)
  }

  if (!updatedStockRow) {
    throw new Error("Stok değişti. Lütfen sayfayı yenileyip tekrar deneyin.")
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
    throw new Error(`Satış kaydı oluşturulamadı: ${saleInsertError.message}`)
  }

  revalidatePath("/dashboard/stok")
  revalidatePath("/dashboard/kasa")
}
