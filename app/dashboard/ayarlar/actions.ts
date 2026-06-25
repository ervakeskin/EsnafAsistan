"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { makeForwardingAddress } from "@/lib/email"

export type ActionResult = { success: boolean; message: string }

export async function saveShopNameAction(formData: FormData): Promise<ActionResult> {
  const shopName = String(formData.get("shop_name") ?? "").trim()

  if (!shopName) {
    return { success: false, message: "Dükkan adı boş bırakılamaz." }
  }

  const supabase = await createClient()
  const { data: existing } = await supabase.from("shop_settings").select("id, forwarding_address").limit(1).maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("shop_settings")
      .update({ shop_name: shopName, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) return { success: false, message: `Dükkan adı kaydedilemedi: ${error.message}` }
  } else {
    const { data: newRow, error } = await supabase
      .from("shop_settings")
      .insert({ shop_name: shopName })
      .select("id")
      .single()

    if (error || !newRow) return { success: false, message: `Dükkan adı kaydedilemedi: ${error?.message ?? "bilinmeyen hata"}` }

    const address = makeForwardingAddress(newRow.id)
    await supabase.from("shop_settings").update({ forwarding_address: address }).eq("id", newRow.id)
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard")
  return { success: true, message: "Dükkan adı kaydedildi." }
}

export async function createWarehouseAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim()
  const locationType = String(formData.get("location_type") ?? "depo").trim()

  if (!name) {
    return { success: false, message: "Lokasyon adı boş bırakılamaz." }
  }

  if (locationType !== "depo" && locationType !== "raf") {
    return { success: false, message: "Geçerli bir lokasyon türü seçin (depo veya raf)." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").insert({ name, is_active: true, location_type: locationType })

  if (error) {
    return { success: false, message: `Depo eklenemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
  return { success: true, message: `"${name}" başarıyla eklendi.` }
}

export async function renameWarehouseAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()

  if (!id || !name) {
    return { success: false, message: "Depo bilgileri eksik." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").update({ name }).eq("id", id)

  if (error) {
    return { success: false, message: `Depo adı güncellenemedi: ${error.message}` }
  }

  await supabase.from("products").update({ warehouse: name }).eq("warehouse_id", id)

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
  return { success: true, message: "Lokasyon adı güncellendi." }
}

export async function toggleWarehouseActiveAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()
  const currentActive = String(formData.get("is_active") ?? "true").trim() === "true"

  if (!id) {
    return { success: false, message: "Depo seçilemedi." }
  }

  const supabase = await createClient()

  if (currentActive) {
    const { count, error: countError } = await supabase
      .from("warehouses")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    if (countError) {
      return { success: false, message: `Depo durumu kontrol edilemedi: ${countError.message}` }
    }

    if ((count ?? 0) <= 1) {
      return { success: false, message: "En az bir depo aktif kalmalıdır." }
    }
  }

  const { error } = await supabase
    .from("warehouses")
    .update({ is_active: !currentActive })
    .eq("id", id)

  if (error) {
    return { success: false, message: `Depo durumu güncellenemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
  return { success: true, message: currentActive ? "Lokasyon pasifleştirildi." : "Lokasyon aktifleştirildi." }
}

export async function deleteWarehouseAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()

  if (!id) {
    return { success: false, message: "Silinecek lokasyon seçilemedi." }
  }

  const supabase = await createClient()

  const { count, error: countError } = await supabase
    .from("warehouses")
    .select("id", { count: "exact", head: true })

  if (countError) {
    return { success: false, message: `Lokasyon sayısı kontrol edilemedi: ${countError.message}` }
  }

  if ((count ?? 0) <= 1) {
    return { success: false, message: "Son lokasyon silinemez. En az bir lokasyon kalmalıdır." }
  }

  const { error } = await supabase.from("warehouses").delete().eq("id", id)

  if (error) {
    return { success: false, message: `Lokasyon silinemedi: ${error.message}` }
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
  return { success: true, message: "Lokasyon silindi." }
}

export async function removeKnownSenderAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim()

  if (!id) {
    return { success: false, message: "Gönderici seçilemedi." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("linked_emails").delete().eq("id", id)

  if (error) {
    return { success: false, message: `Gönderici kaldırılamadı: ${error.message}` }
  }

  revalidatePath("/dashboard/ayarlar")
  return { success: true, message: "Gönderici listeden kaldırıldı." }
}
