"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function createDeliveryAction(formData: FormData) {
  const supplierName = String(formData.get("supplier_name") ?? "").trim()
  const productId = String(formData.get("product_id") ?? "").trim()
  const expectedDate = String(formData.get("expected_date") ?? "").trim()
  const rawQuantity = String(formData.get("quantity") ?? "").trim()
  const quantity = Number(rawQuantity)

  if (!supplierName) {
    throw new Error("Tedarikçi adı zorunludur.")
  }

  if (!expectedDate) {
    throw new Error("Beklenen teslim tarihi zorunludur.")
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Miktar 1 veya daha büyük bir tam sayı olmalı.")
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
    throw new Error(`Teslimat eklenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/teslimatlar")
}

// Teslimat durumunu günceller (bekliyor / teslim-alindi / iptal)
export async function updateDeliveryStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  const status = String(formData.get("status") ?? "").trim()

  if (!id) {
    throw new Error("Güncellenecek teslimat bulunamadı.")
  }

  if (!["bekliyor", "teslim-alindi", "iptal"].includes(status)) {
    throw new Error("Geçersiz teslimat durumu.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("deliveries").update({ status }).eq("id", id)

  if (error) {
    throw new Error(`Durum güncellenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/teslimatlar")
}

// Teslimat kaydını siler
export async function deleteDeliveryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) {
    throw new Error("Silinecek teslimat bulunamadı.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("deliveries").delete().eq("id", id)

  if (error) {
    throw new Error(`Teslimat silinemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/teslimatlar")
}
