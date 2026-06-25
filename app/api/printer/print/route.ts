import { NextResponse } from "next/server"
import { createSaleReceipt, createLabel } from "@/lib/integrations/yazici"

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json() as {
      type?: "receipt" | "label"
      data?: Record<string, unknown>
    }

    if (!type || !data) {
      return NextResponse.json({ message: "Eksik bilgi." }, { status: 400 })
    }

    let output = ""

    if (type === "receipt") {
      output = createSaleReceipt(
        String(data.shopName ?? "Dükkanım"),
        (data.items as Array<{ name: string; quantity: number; unitPrice: number; total: number }>) ?? [],
        Number(data.total ?? 0),
        String(data.paymentType ?? "nakit"),
      )
    } else if (type === "label") {
      output = createLabel(
        String(data.productName ?? ""),
        Number(data.price ?? 0),
        String(data.barcode ?? ""),
      )
    } else {
      return NextResponse.json({ message: "Geçersiz yazdırma türü." }, { status: 400 })
    }

    return new NextResponse(output, {
      headers: { "Content-Type": "text/plain" },
    })
  } catch {
    return NextResponse.json({ message: "Yazdırma başarısız." }, { status: 500 })
  }
}
