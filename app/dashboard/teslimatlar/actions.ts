"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type ActionResult = { success: boolean; message: string }

export async function createDeliveryAction(formData: FormData): Promise<ActionResult> {
  const supplierName = String(formData.get("supplier_name") ?? "").trim()
  const productName = String(formData.get("product_name") ?? "").trim()
  const productId = String(formData.get("product_id") ?? "").trim()
  const expectedDate = String(formData.get("expected_date") ?? "").trim()
  const rawQuantity = String(formData.get("quantity") ?? "").trim()
  const quantity = Number(rawQuantity)

  if (!supplierName) {
    return { success: false, message: "Tedarikçi adı zorunludur." }
  }

  if (!expectedDate) {
    return { success: false, message: "Beklenen teslim tarihi zorunludur." }
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, message: "Miktar 1 veya daha büyük bir tam sayı olmalı." }
  }

  const supabase = await createClient()

  const { error } = await supabase.from("deliveries").insert({
    supplier_name: supplierName,
    product_name: productName || null,
    product_id: productId || null,
    expected_date: expectedDate,
    quantity,
    status: "bekliyor",
  })

  if (error) {
    return { success: false, message: `Teslimat eklenemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/teslimatlar")
  return { success: true, message: "Teslimat başarıyla eklendi." }
}

export async function updateDeliveryStatusAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()
  const status = String(formData.get("status") ?? "").trim()

  if (!id) {
    return { success: false, message: "Güncellenecek teslimat bulunamadı." }
  }

  if (!["bekliyor", "teslim-alindi", "iptal", "işlenmeyi bekliyor"].includes(status)) {
    return { success: false, message: "Geçersiz teslimat durumu." }
  }

  const supabase = await createClient()

  if (status === "teslim-alindi") {
    const { data: delivery, error: fetchError } = await supabase
      .from("deliveries")
      .select("product_id, quantity")
      .eq("id", id)
      .single()

    if (fetchError) {
      return { success: false, message: `Teslimat bilgisi alınamadı: ${fetchError.message}` }
    }

    if (delivery.product_id && delivery.quantity > 0) {
      const { data: product } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", delivery.product_id)
        .single()

      if (product) {
        const newQuantity = (product.quantity ?? 0) + delivery.quantity
        const { error: updateError } = await supabase
          .from("products")
          .update({ quantity: newQuantity })
          .eq("id", delivery.product_id)

        if (updateError) {
          return { success: false, message: `Stok güncellenemedi: ${updateError.message}` }
        }
      }
    }
  }

  const { error } = await supabase.from("deliveries").update({ status }).eq("id", id)

  if (error) {
    return { success: false, message: `Durum güncellenemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/teslimatlar")
  revalidatePath("/dashboard/stok")
  return { success: true, message: `Teslimat durumu "${status === "teslim-alindi" ? "Teslim Alındı" : status}" olarak güncellendi. Stok otomatik arttırıldı.` }
}

export async function deleteDeliveryAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) {
    return { success: false, message: "Silinecek teslimat bulunamadı." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("deliveries").delete().eq("id", id)

  if (error) {
    return { success: false, message: `Teslimat silinemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/teslimatlar")
  return { success: true, message: "Teslimat silindi." }
}

export async function rejectDeliveryAndDisableEmailAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) {
    return { success: false, message: "Teslimat bulunamadı." }
  }

  const supabase = await createClient()

  // 1. Teslimatın hangi e-postadan geldiğini bul
  const { data: delivery, error: fetchError } = await supabase
    .from("deliveries")
    .select("linked_email")
    .eq("id", id)
    .single()

  if (fetchError || !delivery) {
    return { success: false, message: `Teslimat bilgileri alınamadı: ${fetchError?.message}` }
  }

  // 2. Teslimatı iptal et
  const { error: updateError } = await supabase
    .from("deliveries")
    .update({ status: "iptal" })
    .eq("id", id)

  if (updateError) {
    return { success: false, message: `Teslimat iptal edilemedi: ${updateError.message}` }
  }

  let emailMsg = ""
  // 3. E-posta adresinin yapay zeka ile okuma iznini (can_read) kapat (Geri Bildirim Döngüsü)
  if (delivery.linked_email) {
    const { error: emailError } = await supabase
      .from("linked_emails")
      .update({ can_read: false })
      .eq("email", delivery.linked_email)

    if (!emailError) {
      emailMsg = ` ve "${delivery.linked_email}" adresinin yapay zeka okuma izni kapatıldı.`
    }
  }

  revalidatePath("/dashboard/teslimatlar")
  revalidatePath("/dashboard/ayarlar")
  return { success: true, message: `Teslimat iptal edildi${emailMsg}` }
}
