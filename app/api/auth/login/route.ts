import { NextResponse } from "next/server"

import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"
import { checkRateLimit, getRateLimitRemaining } from "@/lib/rate-limiter"
import { createClient } from "@/lib/supabase/server"

type LoginBody = {
  email?: string
  password?: string
}

const LOGIN_LOCKOUT_ATTEMPTS = 5
const LOGIN_LOCKOUT_WINDOW = 15 * 60 * 1000

function mapAuthErrorToTurkish(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid login credentials")) {
    return "Şifre yanlış veya e-posta adresi sistemde bulunamadı."
  }

  if (normalized.includes("email not confirmed")) {
    return "Lütfen e-postanı onaylayarak giriş yap."
  }

  if (normalized.includes("invalid email")) {
    return "E-posta formatı geçersiz."
  }

  if (normalized.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar dene."
  }

  return "Giriş sırasında bir hata oluştu. Lütfen tekrar dene."
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody
    const email = body.email?.trim()
    const password = body.password?.trim()

    if (!email || !password) {
      return NextResponse.json({ message: "E-posta ve şifre alanları zorunludur." }, { status: 400 })
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown"
    const rateLimitKey = `login:${email.toLowerCase()}:${ip}`

    if (!checkRateLimit(rateLimitKey, LOGIN_LOCKOUT_ATTEMPTS, LOGIN_LOCKOUT_WINDOW)) {
      const remaining = getRateLimitRemaining(rateLimitKey, LOGIN_LOCKOUT_ATTEMPTS)
      return NextResponse.json(
        {
          message: `Çok fazla başarısız giriş denemesi. Hesap 15 dakika süreyle kilitlendi. Kalan deneme: ${remaining}`,
        },
        { status: 429 },
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const statusCode = typeof error.status === "number" ? error.status : 401
      return NextResponse.json({ message: mapAuthErrorToTurkish(error.message) }, { status: statusCode })
    }

    if (!data.session) {
      return NextResponse.json(
        { message: "Oturum başlatılamadı. Lütfen tekrar giriş yapmayı dene." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, message: "Giriş başarılı.", redirectTo: "/dashboard" })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }

    return NextResponse.json(
      { message: "Giriş sırasında beklenmeyen bir sorun oluştu. Lütfen tekrar dene." },
      { status: 500 },
    )
  }
}
