import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: "global" })

    if (error) {
      return NextResponse.json({ message: `Çıkış yapılamadı: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: "Tüm cihazlardan çıkış yapıldı." })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "Çıkış sırasında bir hata oluştu." }, { status: 500 })
  }
}
