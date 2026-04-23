import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

type SaleRow = {
  id: string
  quantity: number
  sale_price: number
  purchase_price: number
  customer_name: string | null
  note: string | null
  sold_at: string
  products: {
    name: string
    unit: string
  }[] | null
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value))
}

function getTodayRangeInIstanbul() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const year = Number(parts.find((part) => part.type === "year")?.value)
  const month = Number(parts.find((part) => part.type === "month")?.value)
  const day = Number(parts.find((part) => part.type === "day")?.value)

  // Turkiye saat dilimi UTC+3 sabittir; bu nedenle gun baslangicini UTC'ye ceviriyoruz.
  const startUtc = new Date(Date.UTC(year, month - 1, day, -3, 0, 0, 0))
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000)

  return {
    start: startUtc.toISOString(),
    end: endUtc.toISOString(),
  }
}

export default async function KasaPage() {
  const { start, end } = getTodayRangeInIstanbul()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sales")
    .select("id, quantity, sale_price, purchase_price, customer_name, note, sold_at, products(name, unit)")
    .gte("sold_at", start)
    .lt("sold_at", end)
    .order("sold_at", { ascending: false })

  if (error) {
    throw new Error(`Kasa verisi yuklenemedi: ${error.message}`)
  }

  const sales = (data ?? []) as SaleRow[]

  const todayRevenue = sales.reduce((sum, sale) => sum + Number(sale.sale_price) * Number(sale.quantity), 0)
  const todayProfit = sales.reduce(
    (sum, sale) => sum + (Number(sale.sale_price) - Number(sale.purchase_price)) * Number(sale.quantity),
    0,
  )

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Kasa</h1>
        <p className="text-base text-slate-600">
          Satis fiyatini manuel gir, sistem stok dusumunu ve kar hesabini otomatik yapsin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bugun Kasaya Giren</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-slate-900">{formatPrice(todayRevenue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Toplam {sales.length} satis islemi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bugun Cepte Kalan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-emerald-700">{formatPrice(todayProfit)}</p>
            <p className="mt-2 text-sm text-muted-foreground">(Satis - Alis) x Miktar formulu ile hesaplanir</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Bugunku Satis Hareketleri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Saat</TableHead>
                <TableHead className="text-base">Urun</TableHead>
                <TableHead className="text-base">Musteri</TableHead>
                <TableHead className="text-base">Miktar</TableHead>
                <TableHead className="text-base">Satis</TableHead>
                <TableHead className="text-base">Cepte Kalan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-base text-slate-500">
                    Bugun henuz satis kaydi yok.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => {
                  const productInfo = sale.products?.[0]
                  const lineProfit =
                    (Number(sale.sale_price) - Number(sale.purchase_price)) * Number(sale.quantity)

                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="text-base">{formatDateTime(sale.sold_at)}</TableCell>
                      <TableCell className="text-base font-semibold">
                        {productInfo?.name ?? "Silinmis Urun"}
                      </TableCell>
                      <TableCell className="text-base">
                        {sale.customer_name?.trim() ? sale.customer_name : "-"}
                      </TableCell>
                      <TableCell className="text-base">
                        {sale.quantity} {productInfo?.unit ?? "Adet"}
                      </TableCell>
                      <TableCell className="text-base font-semibold text-slate-900">
                        {formatPrice(Number(sale.sale_price) * Number(sale.quantity))}
                      </TableCell>
                      <TableCell
                        className={`text-base font-semibold ${
                          lineProfit >= 0 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {formatPrice(lineProfit)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
