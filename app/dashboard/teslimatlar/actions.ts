"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type ActionResult = { success: boolean; message: string }

export async function createDeliveryAction(formData: FormData): Promise<ActionResult> {
  const supplierName = String(formData.get("supplier_name") ?? "").trim()
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

  if (!["bekliyor", "teslim-alindi", "iptal"].includes(status)) {
    return { success: false, message: "Geçersiz teslimat durumu." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("deliveries").update({ status }).eq("id", id)

  if (error) {
    return { success: false, message: `Durum güncellenemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/teslimatlar")
  return { success: true, message: `Teslimat durumu "${status === "teslim-alindi" ? "Teslim Alındı" : status}" olarak güncellendi.` }
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
