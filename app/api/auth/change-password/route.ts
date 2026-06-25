import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validatePassword } from "@/lib/password-policy"
import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json() as { currentPassword?: string; newPassword?: string }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Mevcut şifre ve yeni şifre alanları zorunludur." }, { status: 400 })
    }

    const passwordCheck = validatePassword(newPassword)
    if (!passwordCheck.valid) {
      return NextResponse.json({ message: passwordCheck.message }, { status: 400 })
    }

    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email ?? "",
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json({ message: "Mevcut şifreniz yanlış." }, { status: 400 })
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      return NextResponse.json({ message: `Şifre değiştirilemedi: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: "Şifreniz başarıyla değiştirildi." })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "Şifre değiştirme sırasında bir hata oluştu." }, { status: 500 })
  }
}
