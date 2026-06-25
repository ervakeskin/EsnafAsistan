// Termal yazıcı ve etiket yazıcısı desteği

export type PrinterConfig = {
  type: "thermal-80" | "thermal-58" | "label"
  ip?: string
  usbVendorId?: number
  usbProductId?: number
}

export type ReceiptLine = {
  type: "text" | "separator" | "barcode" | "qr"
  content?: string
  align?: "left" | "center" | "right"
  bold?: boolean
  size?: "normal" | "double" | "small"
}

export function generateReceipt(lines: ReceiptLine[]): string {
  const output: string[] = []
  output.push("\x1B\x40") // ESC @ — Reset printer

  for (const line of lines) {
    switch (line.type) {
      case "separator":
        output.push("─".repeat(32) + "\n")
        break
      case "text":
        if (line.bold) output.push("\x1B\x45\x01") // ESC E 1 — Bold on
        if (line.size === "double") output.push("\x1D\x21\x11") // GS ! 0x11 — Double size
        if (line.align === "center") output.push("\x1B\x61\x01") // ESC a 1 — Center
        if (line.align === "right") output.push("\x1B\x61\x02") // ESC a 2 — Right

        output.push((line.content ?? "") + "\n")

        if (line.bold) output.push("\x1B\x45\x00") // Bold off
        if (line.size === "double") output.push("\x1D\x21\x00") // Normal size
        output.push("\x1B\x61\x00") // Align left
        break
      case "barcode":
        output.push("\x1D\x6B\x04" + (line.content ?? "") + "\x00")
        break
      case "qr":
        const esc = "\x1D"
        const qrContent = line.content ?? ""
        output.push(esc + "\x28\x6B\x03\x00\x31\x43\x05")
        output.push(esc + "\x28\x6B\x03\x00\x31\x45\x30")
        output.push(esc + "\x28\x6B" + String.fromCharCode(qrContent.length + 3) + "\x00\x31\x50\x30")
        output.push(qrContent)
        output.push(esc + "\x28\x6B\x03\x00\x31\x51\x30")
        break
    }
  }

  // Feed + cut
  output.push("\n\n\n")
  output.push("\x1D\x56\x00") // GS V — Cut

  return output.join("")
}

export function createSaleReceipt(
  shopName: string,
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>,
  total: number,
  paymentType: string
): string {
  const lines: ReceiptLine[] = [
    { type: "text", content: shopName, align: "center", bold: true, size: "double" },
    { type: "separator" },
    { type: "text", content: `Tarih: ${new Date().toLocaleDateString("tr-TR")}`, align: "center" },
    { type: "text", content: `Saat: ${new Date().toLocaleTimeString("tr-TR")}`, align: "center" },
    { type: "separator" },
  ]

  for (const item of items) {
    lines.push({
      type: "text",
      content: `${item.name} x${item.quantity}`,
    })
    lines.push({
      type: "text",
      content: `  ${item.unitPrice.toFixed(2)} TL × ${item.quantity} = ${item.total.toFixed(2)} TL`,
      align: "right",
    })
  }

  lines.push({ type: "separator" })
  lines.push({
    type: "text",
    content: `TOPLAM: ${total.toFixed(2)} TL`,
    align: "center",
    bold: true,
    size: "double",
  })
  lines.push({
    type: "text",
    content: `Ödeme: ${paymentType === "nakit" ? "Nakit" : paymentType === "kart" ? "Kart" : "Havale"}`,
    align: "center",
  })
  lines.push({ type: "separator" })
  lines.push({
    type: "text",
    content: "Teşekkür ederiz!",
    align: "center",
    bold: true,
  })
  lines.push({
    type: "qr",
    content: "https://esnafasitan.vercel.app",
  })

  return generateReceipt(lines)
}

export function createLabel(productName: string, price: number, barcode?: string): string {
  const lines: ReceiptLine[] = [
    { type: "text", content: productName, align: "center", bold: true, size: "double" },
    { type: "text", content: `${price.toFixed(2)} TL`, align: "center", size: "double" },
  ]

  if (barcode) {
    lines.push({ type: "barcode", content: barcode })
  }

  return generateReceipt(lines)
}
