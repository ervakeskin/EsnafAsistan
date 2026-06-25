import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createEFaturaFromSales, generateEFaturaXml } from "@/lib/integrations/efatura"

export async function POST(request: Request) {
  try {
    const { saleIds, recipient } = await request.json() as {
      saleIds?: string[]
      recipient?: { vkn: string; title: string; name: string; surname: string; email: string }
    }

    if (!saleIds?.length || !recipient) {
      return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: rawSales } = await supabase
      .from("sales")
      .select("id, quantity, sale_price, sold_at, products(name)")
      .in("id", saleIds)

    if (!rawSales?.length) {
      return NextResponse.json({ message: "Satış bulunamadı." }, { status: 404 })
    }

    const sales = rawSales.map((s) => ({
      id: String(s.id),
      products: s.products?.[0] ? { name: String(s.products[0].name) } : null,
      quantity: Number(s.quantity),
      sale_price: Number(s.sale_price),
      sold_at: String(s.sold_at),
    }))

    const invoice = createEFaturaFromSales(sales, recipient)
    const xml = generateEFaturaXml(invoice)

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="efatura-${invoice.id}.xml"`,
      },
    })
  } catch {
    return NextResponse.json({ message: "e-Fatura oluşturulamadı." }, { status: 500 })
  }
}
