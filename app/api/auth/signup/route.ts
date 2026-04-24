import { NextResponse } from "next/server"

import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"
import { createClient } from "@/lib/supabase/server"

type SignupBody = {
  email?: string
  password?: string
}

function mapSignupErrorToTurkish(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("user already registered")) {
    return "Bu e-posta adresiyle zaten bir hesap var."
  }

  if (normalized.includes("password should be at least")) {
    return "Şifre en az 6 karakter olmalıdır."
  }

  if (normalized.includes("invalid email")) {
    return "E-posta formatı geçersiz."
  }

  if (normalized.includes("rate limit")) {
    return "Çok fazla kayıt denemesi yapıldı. Lütfen kısa bir süre sonra tekrar dene."
  }

  if (normalized.includes("signups not allowed")) {
    return "Sistemde yeni hesap açma geçici olarak kapalı."
  }

  return "Kayıt sırasında bir hata oluştu. Lütfen tekrar dene."
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody
    const email = body.email?.trim()
    const password = body.password?.trim()

    if (!email || !password) {
      return NextResponse.json({ message: "E-posta ve şifre alanları zorunludur." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Şifre en az 6 karakter olmalıdır." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      const statusCode = typeof error.status === "number" ? error.status : 400
      return NextResponse.json({ message: mapSignupErrorToTurkish(error.message) }, { status: statusCode })
    }

    const requiresEmailConfirmation = !data.session

    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? "Kayıt başarılı. Lütfen e-postanı onaylayarak giriş yap."
        : "Kayıt başarılı. Oturumun açıldı, panele yönlendiriliyorsun.",
    })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }

    return NextResponse.json(
      { message: "Kayıt sırasında beklenmeyen bir sorun oluştu. Lütfen tekrar dene." },
      { status: 500 },
    )
  }
}
