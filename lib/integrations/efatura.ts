// e-Fatura / e-Arşiv / e-Defter entegrasyonu
// Gelir İdaresi Başkanlığı uyumlu XML çıktısı

export type EFaturaRecipient = {
  vkn: string
  title: string
  name: string
  surname: string
  email: string
}

export type EFaturaItem = {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
}

export type EFaturaInvoice = {
  id: string
  date: string
  recipient: EFaturaRecipient
  items: EFaturaItem[]
  totalVat: number
  totalWithoutVat: number
  totalWithVat: number
}

export function generateEFaturaXml(invoice: EFaturaInvoice): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<Invoice>",
    `  <InvoiceID>${invoice.id}</InvoiceID>`,
    `  <Date>${invoice.date}</Date>`,
    "  <Supplier>",
    "    <VKN>1234567890</VKN>",
    "    <Title>EsnafAsistan</Title>",
    "  </Supplier>",
    "  <Customer>",
    `    <VKN>${invoice.recipient.vkn}</VKN>`,
    `    <Title>${invoice.recipient.title}</Title>`,
    `    <Name>${invoice.recipient.name}</Name>`,
    `    <Surname>${invoice.recipient.surname}</Surname>`,
    `    <Email>${invoice.recipient.email}</Email>`,
    "  </Customer>",
    "  <Items>",
  ]

  for (const item of invoice.items) {
    const vat = item.unitPrice * item.quantity * (item.vatRate / 100)
    lines.push("    <Item>")
    lines.push(`      <Name>${item.name}</Name>`)
    lines.push(`      <Quantity>${item.quantity}</Quantity>`)
    lines.push(`      <Unit>${item.unit}</Unit>`)
    lines.push(`      <UnitPrice>${item.unitPrice.toFixed(2)}</UnitPrice>`)
    lines.push(`      <VatRate>${item.vatRate}</VatRate>`)
    lines.push(`      <VatAmount>${vat.toFixed(2)}</VatAmount>`)
    lines.push("    </Item>")
  }

  lines.push("  </Items>")
  lines.push("  <Summary>")
  lines.push(`    <TotalWithoutVat>${invoice.totalWithoutVat.toFixed(2)}</TotalWithoutVat>`)
  lines.push(`    <TotalVat>${invoice.totalVat.toFixed(2)}</TotalVat>`)
  lines.push(`    <TotalWithVat>${invoice.totalWithVat.toFixed(2)}</TotalWithVat>`)
  lines.push("  </Summary>")
  lines.push("</Invoice>")

  return lines.join("\n")
}

export function createEFaturaFromSales(
  sales: Array<{ id: string; products: { name: string } | null; quantity: number; sale_price: number; sold_at: string }>,
  recipient: EFaturaRecipient
): EFaturaInvoice {
  const items: EFaturaItem[] = sales.map((s) => ({
    name: s.products?.name ?? "Ürün",
    quantity: s.quantity,
    unit: "Adet",
    unitPrice: Number(s.sale_price) / s.quantity,
    vatRate: 20,
  }))

  const totalWithoutVat = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const totalVat = items.reduce((s, i) => s + i.unitPrice * i.quantity * (i.vatRate / 100), 0)

  return {
    id: `EF${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    recipient,
    items,
    totalVat,
    totalWithoutVat,
    totalWithVat: totalWithoutVat + totalVat,
  }
}
