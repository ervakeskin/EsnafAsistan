import { NextResponse } from "next/server"
import { createAdminClient, createClient } from "@/lib/supabase/server"
import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    const userId = user.id

    const adminDb = createAdminClient()

    await adminDb.from("audit_log").update({ changed_by: "ANONYMIZED" }).eq("changed_by", userId)
    await adminDb.from("products").update({ name: "Silinmiş Ürün", photo_url: null }).eq("user_id", userId)
    await adminDb.from("sales").update({ customer_name: null, note: null }).eq("user_id", userId)
    await adminDb.from("deliveries").update({ supplier_name: "Silinmiş", product_name: null }).eq("user_id", userId)
    await adminDb.from("reminders").delete().eq("user_id", userId)
    await adminDb.from("linked_emails").delete().eq("user_id", userId)
    await adminDb.from("shop_settings").delete().eq("user_id", userId)
    await adminDb.from("warehouses").delete().eq("user_id", userId)

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      return NextResponse.json({ message: `Hesap silinemedi: ${deleteError.message}` }, { status: 500 })
    }

    await supabase.auth.signOut()

    return NextResponse.json({ ok: true, message: "Hesabınız ve tüm verileriniz başarıyla silindi." })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "Hesap silme sırasında bir hata oluştu." }, { status: 500 })
  }
}
