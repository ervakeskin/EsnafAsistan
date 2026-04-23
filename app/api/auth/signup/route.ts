import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type SignupBody = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
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
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return NextResponse.json({ message: `Kayıt başarısız: ${error.message}` }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    message: "Kayıt başarılı. E-posta doğrulaması açıksa lütfen kutunuzu kontrol edin.",
  })
}
