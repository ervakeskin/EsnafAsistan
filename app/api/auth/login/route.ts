import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type LoginBody = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody
  const email = body.email?.trim()
  const password = body.password?.trim()

  if (!email || !password) {
    return NextResponse.json({ message: "E-posta ve şifre alanları zorunludur." }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ message: "Giriş başarısız: E-posta veya şifre hatalı." }, { status: 401 })
  }

  return NextResponse.json({ ok: true, message: "Giriş başarılı." })
}
