// Banka entegrasyonu — hesap hareketlerini otomatik çekme ve kasa mutabakatı

export type BankTransaction = {
  id: string
  date: string
  description: string
  amount: number
  balance: number
  type: "credit" | "debit"
}

export type BankAccount = {
  bankName: string
  iban: string
  balance: number
  currency: string
}

export async function fetchBankTransactions(
  _bankCode: string,
  _accountNumber: string,
  _dateFrom: string,
  _dateTo: string
): Promise<BankTransaction[]> {
  // Gerçek banka API'si entegrasyonu için:
  // - Akbank API
  // - İşbank API
  // - Garanti BBVA API
  // - Ziraat Bankası API
  // Her bankanın kendi API dökümanına göre implementasyon yapılmalıdır.

  console.warn("[Banka] API entegrasyonu için banka API anahtarları gerekli.")
  return []
}

export function reconcileWithCashRegister(
  bankTransactions: BankTransaction[],
  cashSales: Array<{ date: string; amount: number }>
): Array<{ date: string; bankAmount: number; cashAmount: number; difference: number }> {
  const reconciled: Array<{ date: string; bankAmount: number; cashAmount: number; difference: number }> = []

  const bankByDate = new Map<string, number>()
  for (const tx of bankTransactions) {
    const day = tx.date.slice(0, 10)
    bankByDate.set(day, (bankByDate.get(day) ?? 0) + tx.amount)
  }

  const cashByDate = new Map<string, number>()
  for (const sale of cashSales) {
    const day = sale.date.slice(0, 10)
    cashByDate.set(day, (cashByDate.get(day) ?? 0) + sale.amount)
  }

  const allDates = new Set([...bankByDate.keys(), ...cashByDate.keys()])
  for (const date of allDates) {
    const bankAmount = bankByDate.get(date) ?? 0
    const cashAmount = cashByDate.get(date) ?? 0
    reconciled.push({ date, bankAmount, cashAmount, difference: bankAmount - cashAmount })
  }

  return reconciled.sort((a, b) => a.date.localeCompare(b.date))
}
