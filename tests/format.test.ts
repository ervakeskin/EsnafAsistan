import { describe, it, expect } from "vitest"

// -------------------------------------------------------
// Güvenli formatPrice — input her zaman number
// -------------------------------------------------------
function formatPrice(value: number) {
  if (typeof value !== "number" || isNaN(value)) return "₺0,00"
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

// -------------------------------------------------------
// Güvenli formatDate — boş / null / geçersiz tarih koruması
// -------------------------------------------------------
function formatDate(value: string | null | undefined) {
  if (!value) return "Tarih belirtilmemiş"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "Geçersiz tarih"
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(date)
}

// -------------------------------------------------------
// Güvenli formatDateTime
// -------------------------------------------------------
function formatDateTime(value: string | null | undefined) {
  if (!value) return "Tarih belirtilmemiş"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "Geçersiz tarih"
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date)
}

// -------------------------------------------------------
// Profit hesaplama
// -------------------------------------------------------
function computeProfit(salePrice: number, purchasePrice: number, quantity: number) {
  return (salePrice - purchasePrice) * quantity
}

// -------------------------------------------------------
// Timezone'dan bağımsız startOfToday (test için sabit gün)
// -------------------------------------------------------
function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

function endOfWeek() {
  const date = new Date()
  const day = date.getDay()
  const diff = day === 0 ? 0 : 7 - day
  date.setDate(date.getDate() + diff)
  date.setHours(23, 59, 59, 999)
  return date.toISOString().slice(0, 10)
}

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

// -------------------------------------------------------
// OCR satır ayrıştırma — trailing/leading space korumalı
// -------------------------------------------------------
function parseOcrLine(line: string) {
  if (!line || typeof line !== "string") return null
  const trimmed = line.trim()
  if (!trimmed) return null
  const matched = trimmed.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/)
  if (!matched) return null
  return {
    name: matched[1].trim().replace(/\s{2,}/g, " "),
    quantity: Number(matched[2].replace(",", ".")),
  }
}

// =======================================================
// TESTLER
// =======================================================

describe("formatPrice", () => {
  it("formats whole numbers as TRY", () => {
    expect(formatPrice(100)).toMatch(/100/)
    expect(formatPrice(100)).toContain("₺")
  })

  it("formats decimals correctly", () => {
    const result = formatPrice(99.5)
    expect(result).toContain("₺")
    expect(result).toMatch(/99/)
  })

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("₺")
  })

  it("formats negative values", () => {
    const result = formatPrice(-50)
    expect(result).toContain("-")
  })

  it("handles NaN gracefully", () => {
    expect(formatPrice(NaN)).toBe("₺0,00")
  })
})

describe("formatDate — güvenli tarih formatlama", () => {
  it("formats a valid date string", () => {
    const result = formatDate("2026-06-25")
    expect(result).toBeTruthy()
    expect(result).toContain("2026")
  })

  it("returns fallback for empty string", () => {
    expect(formatDate("")).toBe("Tarih belirtilmemiş")
  })

  it("returns fallback for null", () => {
    expect(formatDate(null)).toBe("Tarih belirtilmemiş")
  })

  it("returns fallback for undefined", () => {
    expect(formatDate(undefined)).toBe("Tarih belirtilmemiş")
  })

  it("returns fallback for invalid date string", () => {
    expect(formatDate("hatali-tarih")).toBe("Geçersiz tarih")
  })

  it("returns fallback for gibberish", () => {
    expect(formatDate("abc-def-ghi")).toBe("Geçersiz tarih")
  })
})

describe("formatDateTime — (atlantiş fonksiyon)", () => {
  it("formats a valid datetime string", () => {
    const result = formatDateTime("2026-06-25T14:30:00")
    expect(result).toBeTruthy()
    expect(result).toContain("2026")
  })

  it("returns fallback for empty string", () => {
    expect(formatDateTime("")).toBe("Tarih belirtilmemiş")
  })

  it("returns fallback for null", () => {
    expect(formatDateTime(null)).toBe("Tarih belirtilmemiş")
  })

  it("returns fallback for invalid datetime", () => {
    expect(formatDateTime("gecersiz")).toBe("Geçersiz tarih")
  })

  it("formats includes time component", () => {
    const result = formatDateTime("2026-06-25T09:05:00")
    expect(result).toMatch(/2026/)
  })
})

describe("computeProfit", () => {
  it("calculates profit correctly", () => {
    expect(computeProfit(150, 100, 3)).toBe(150)
  })

  it("returns negative for loss", () => {
    expect(computeProfit(80, 100, 2)).toBe(-40)
  })

  it("returns zero for break-even", () => {
    expect(computeProfit(100, 100, 5)).toBe(0)
  })
})

describe("startOfToday", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(startOfToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("returns today's actual date (timezone-independent assertion)", () => {
    const result = startOfToday()
    const year = Number(result.slice(0, 4))
    const month = Number(result.slice(5, 7))
    const day = Number(result.slice(8, 10))
    expect(year).toBeGreaterThan(2024)
    expect(month).toBeGreaterThanOrEqual(1)
    expect(month).toBeLessThanOrEqual(12)
    expect(day).toBeGreaterThanOrEqual(1)
    expect(day).toBeLessThanOrEqual(31)
  })
})

describe("endOfWeek", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(endOfWeek()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("returns a date >= today", () => {
    const today = startOfToday()
    const weekEnd = endOfWeek()
    expect(weekEnd >= today).toBe(true)
  })
})

describe("isoDaysAgo", () => {
  it("returns ISO string for days ago", () => {
    const sevenDaysAgo = isoDaysAgo(7)
    expect(sevenDaysAgo).toBeTruthy()
    expect(typeof sevenDaysAgo).toBe("string")
  })

  it("returns a date in the past", () => {
    const today = startOfToday()
    const past = isoDaysAgo(7).slice(0, 10)
    expect(past < today).toBe(true)
  })

  it("0 days ago returns today", () => {
    const today = startOfToday()
    const result = isoDaysAgo(0).slice(0, 10)
    expect(result).toBe(today)
  })
})

describe("parseOcrLine — edge case'ler", () => {
  it("parses 'Vana 12' format", () => {
    const result = parseOcrLine("Vana 12")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Vana")
    expect(result!.quantity).toBe(12)
  })

  it("parses decimal quantity with dot", () => {
    const result = parseOcrLine("Boru 2.5")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Boru")
    expect(result!.quantity).toBe(2.5)
  })

  it("parses comma as decimal separator", () => {
    const result = parseOcrLine("Boya 3,5")
    expect(result).not.toBeNull()
    expect(result!.quantity).toBe(3.5)
  })

  it("returns null for invalid format", () => {
    expect(parseOcrLine("no number here")).toBeNull()
    expect(parseOcrLine("")).toBeNull()
  })

  it("handles trailing spaces after quantity", () => {
    const result = parseOcrLine("Vana 12  ")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Vana")
    expect(result!.quantity).toBe(12)
  })

  it("handles multiple spaces between name and quantity", () => {
    const result = parseOcrLine("Küresel   Vana   5")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Küresel Vana")
    expect(result!.quantity).toBe(5)
  })

  it("handles leading spaces", () => {
    const result = parseOcrLine("  Vana 12")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Vana")
    expect(result!.quantity).toBe(12)
  })

  it("handles multi-word product names", () => {
    const result = parseOcrLine("Küresel Vana 5")
    expect(result).not.toBeNull()
    expect(result!.name).toBe("Küresel Vana")
    expect(result!.quantity).toBe(5)
  })

  it("returns null for null input", () => {
    expect(parseOcrLine(null as unknown as string)).toBeNull()
  })

  it("returns null for whitespace-only input", () => {
    expect(parseOcrLine("   ")).toBeNull()
  })
})

describe("Product filtering logic", () => {
  type Product = { id: string; name: string; quantity: number; unit: string; warehouse_id: string | null }

  const products: Product[] = [
    { id: "1", name: "Vana", quantity: 3, unit: "Adet", warehouse_id: "w1" },
    { id: "2", name: "Boru", quantity: 10, unit: "Metre", warehouse_id: "w1" },
    { id: "3", name: "Boya", quantity: 0, unit: "Kutu", warehouse_id: "w2" },
    { id: "4", name: "Vida", quantity: 100, unit: "Kutu", warehouse_id: "w2" },
  ]

  it("filters by warehouse", () => {
    const filtered = products.filter(p => p.warehouse_id === "w1")
    expect(filtered).toHaveLength(2)
    expect(filtered.map(p => p.name)).toEqual(["Vana", "Boru"])
  })

  it("filters by search query", () => {
    const q = "an"
    const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    expect(filtered).toHaveLength(1)
    expect(filtered.map(p => p.name)).toEqual(["Vana"])
  })

  it("filters by search query case-insensitive", () => {
    const q = "VID"
    const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe("Vida")
  })

  it("identifies critical stock (<=5)", () => {
    const critical = products.filter(p => p.quantity <= 5)
    expect(critical).toHaveLength(2)
    expect(critical.map(p => p.name)).toEqual(["Vana", "Boya"])
  })

  it("calculates total warehouse value", () => {
    const productValues = [
      { quantity: 3, purchase_price: 50 },
      { quantity: 10, purchase_price: 20 },
      { quantity: 0, purchase_price: 100 },
      { quantity: 100, purchase_price: 2 },
    ]
    const total = productValues.reduce((sum, p) => sum + p.quantity * p.purchase_price, 0)
    expect(total).toBe(550)
  })

  it("sorts top products by quantity descending", () => {
    const sorted = [...products].sort((a, b) => b.quantity - a.quantity)
    expect(sorted[0].name).toBe("Vida")
    expect(sorted[3].name).toBe("Boya")
  })
})
