"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function createLinkedEmailAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()

  if (!email.includes("@")) {
    throw new Error("Geçerli bir e-posta adresi girin.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("linked_emails").insert({ email, is_active: true })

  if (error) {
    throw new Error(`E-posta eklenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/ayarlar")
}

export async function removeLinkedEmailAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()

  if (!id) {
    throw new Error("Silinecek e-posta seçilemedi.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("linked_emails").delete().eq("id", id)

  if (error) {
    throw new Error(`E-posta kaldırılamadı: ${error.message}`)
  }

  revalidatePath("/dashboard/ayarlar")
}

export async function createWarehouseAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()

  if (!name) {
    throw new Error("Depo adı boş bırakılamaz.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").insert({ name, is_active: true })

  if (error) {
    throw new Error(`Depo eklenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
}

export async function renameWarehouseAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()

  if (!id || !name) {
    throw new Error("Depo bilgileri eksik.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("warehouses").update({ name }).eq("id", id)

  if (error) {
    throw new Error(`Depo adı güncellenemedi: ${error.message}`)
  }

  // Uyumluluk için products.warehouse alanını da güncel tutuyoruz.
  await supabase.from("products").update({ warehouse: name }).eq("warehouse_id", id)

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
}

export async function toggleWarehouseActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim()
  const currentActive = String(formData.get("is_active") ?? "true").trim() === "true"

  if (!id) {
    throw new Error("Depo seçilemedi.")
  }

  const supabase = await createClient()

  if (currentActive) {
    const { count, error: countError } = await supabase
      .from("warehouses")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)

    if (countError) {
      throw new Error(`Depo durumu kontrol edilemedi: ${countError.message}`)
    }

    if ((count ?? 0) <= 1) {
      throw new Error("En az bir depo aktif kalmalıdır.")
    }
  }

  const { error } = await supabase
    .from("warehouses")
    .update({ is_active: !currentActive })
    .eq("id", id)

  if (error) {
    throw new Error(`Depo durumu güncellenemedi: ${error.message}`)
  }

  revalidatePath("/dashboard/ayarlar")
  revalidatePath("/dashboard/stok")
}
