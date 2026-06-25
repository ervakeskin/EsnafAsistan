import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AUTH_CONFIG_ERROR_MESSAGE, isSupabaseConfigError } from "@/lib/auth/messages"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    return NextResponse.json({
      email: user.email,
      emailVerified: !!user.email_confirmed_at,
      emailConfirmedAt: user.email_confirmed_at,
      createdAt: user.created_at,
    })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "Bilgiler alınamadı." }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ message: "E-postanız zaten doğrulanmış." }, { status: 400 })
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
    })

    if (error) {
      return NextResponse.json({ message: `Doğrulama e-postası gönderilemedi: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ ok: true, message: "Doğrulama e-postası gönderildi. Gelen kutunu kontrol et." })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "Doğrulama e-postası gönderilemedi." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { email } = await request.json() as { email?: string }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Geçerli bir e-posta adresi girin." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    if (user.email === email) {
      return NextResponse.json({ message: "Yeni e-posta adresi mevcut adresinle aynı." }, { status: 400 })
    }

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      return NextResponse.json({ message: `E-posta güncellenemedi: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      message: "E-posta adresin güncellendi. Yeni adresine bir doğrulama bağlantısı gönderildi.",
    })
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return NextResponse.json({ message: AUTH_CONFIG_ERROR_MESSAGE }, { status: 500 })
    }
    return NextResponse.json({ message: "E-posta güncellenemedi." }, { status: 500 })
  }
}
