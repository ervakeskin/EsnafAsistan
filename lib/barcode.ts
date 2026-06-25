export function isValidBarcode(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) return false
  const digits = code.split("").map(Number)
  const checkDigit = digits.pop()!
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }
  const calculated = (10 - (sum % 10)) % 10
  return calculated === checkDigit
}

export function detectBarcodeFormat(code: string): "EAN8" | "EAN13" | "UPC" | "UNKNOWN" {
  if (code.length === 8) return "EAN8"
  if (code.length === 12) return "UPC"
  if (code.length === 13) return "EAN13"
  return "UNKNOWN"
}
