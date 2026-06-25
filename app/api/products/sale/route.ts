import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const productId = formData.get("product_id") as string
    const quantity = Number(formData.get("quantity"))
    const salePrice = Number(formData.get("sale_price"))
    const paymentType = (formData.get("payment_type") as string) || "nakit"
    const customerName = (formData.get("customer_name") as string) || null

    if (!productId || !quantity || !salePrice) {
      return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, quantity, unit, purchase_price")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 })
    }

    if (product.quantity < quantity) {
      return NextResponse.json({ message: `Yetersiz stok! Stokta ${product.quantity} ${product.unit} var.` }, { status: 400 })
    }

    const { error: insertError } = await supabase.from("sales").insert({
      product_id: productId,
      quantity,
      sale_price: salePrice,
      purchase_price: product.purchase_price,
      payment_type: paymentType,
      customer_name: customerName,
    })

    if (insertError) {
      return NextResponse.json({ message: `Satış kaydedilemedi: ${insertError.message}` }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ quantity: product.quantity - quantity })
      .eq("id", productId)

    if (updateError) {
      return NextResponse.json({ message: `Stok güncellenemedi: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Satış başarıyla kaydedildi." })
  } catch {
    return NextResponse.json({ message: "Satış sırasında bir hata oluştu." }, { status: 500 })
  }
}
