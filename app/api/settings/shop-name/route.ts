import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { shopName } = await request.json() as { shopName?: string }
    if (!shopName?.trim()) {
      return NextResponse.json({ message: "Dükkan adı zorunludur." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: "Oturum bulunamadı." }, { status: 401 })
    }

    const { error } = await supabase
      .from("shop_settings")
      .upsert({ shop_name: shopName.trim(), user_id: user.id }, { onConflict: "user_id" })

    if (error) {
      return NextResponse.json({ message: `Kaydedilemedi: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Bir hata oluştu." }, { status: 500 })
  }
}
