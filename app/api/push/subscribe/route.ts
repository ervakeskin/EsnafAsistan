import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const subscription = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    const { error } = await supabase.from("push_subscriptions").insert({
      user_id: user.id,
      subscription,
    })

    if (error) {
      return NextResponse.json({ message: `Kaydedilemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Bir hata oluştu." }, { status: 500 })
  }
}
