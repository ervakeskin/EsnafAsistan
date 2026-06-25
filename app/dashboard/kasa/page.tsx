import { Breadcrumb } from "@/components/dashboard/breadcrumb"
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
  payment_type: string
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

  // Türkiye saat dilimi UTC+3 sabittir; bu nedenle gün başlangıcını UTC'ye çeviriyoruz.
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
    .select("id, quantity, sale_price, purchase_price, customer_name, note, payment_type, sold_at, products(name, unit)")
    .gte("sold_at", start)
    .lt("sold_at", end)
    .order("sold_at", { ascending: false })

  if (error) {
    console.error("Kasa verisi yüklenemedi:", error.message)
  }

  const sales = (data ?? []) as SaleRow[]

  const todayRevenue = sales.reduce((sum, sale) => sum + Number(sale.sale_price) * Number(sale.quantity), 0)
  const todayProfit = sales.reduce(
    (sum, sale) => sum + (Number(sale.sale_price) - Number(sale.purchase_price)) * Number(sale.quantity),
    0,
  )

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Kasa" }]} />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Kasa</h1>
        <p className="text-base text-muted-foreground">
          Satış fiyatını manuel gir, sistem stok düşümünü ve kâr hesabını otomatik yapsın.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Bugün Kasaya Giren</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-foreground">{formatPrice(todayRevenue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Toplam {sales.length} satış işlemi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Bugün Cepte Kalan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold tracking-tight text-success">{formatPrice(todayProfit)}</p>
            <p className="mt-2 text-sm text-muted-foreground">(Satış - Alış) x Miktar formülü ile hesaplanır</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Bugünkü Satış Hareketleri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Saat</TableHead>
                <TableHead className="text-base">Ürün</TableHead>
                <TableHead className="text-base">Müşteri</TableHead>
                <TableHead className="text-base">Miktar</TableHead>
                <TableHead className="text-base">Ödeme</TableHead>
                <TableHead className="text-base">Satış</TableHead>
                <TableHead className="text-base">Cepte Kalan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-base text-muted-foreground">
                    Bugün henüz satış kaydı yok.
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
                        {productInfo?.name ?? "Silinmiş Ürün"}
                      </TableCell>
                      <TableCell className="text-base">
                        {sale.customer_name?.trim() ? sale.customer_name : "-"}
                      </TableCell>
                      <TableCell className="text-base">
                        {sale.quantity} {productInfo?.unit ?? "Adet"}
                      </TableCell>
                      <TableCell className="text-base">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
                          sale.payment_type === "nakit" ? "bg-success-bg text-success" :
                          sale.payment_type === "kart" ? "bg-blue-100 text-blue-800" :
                          "bg-warning-bg text-warning"
                        }`}>
                          {sale.payment_type === "nakit" ? "Nakit" : sale.payment_type === "kart" ? "Kart" : "Havale"}
                        </span>
                      </TableCell>
                      <TableCell className="text-base font-semibold text-foreground">
                        {formatPrice(Number(sale.sale_price) * Number(sale.quantity))}
                      </TableCell>
                      <TableCell
                        className={`text-base font-semibold ${
                          lineProfit >= 0 ? "text-success" : "text-danger"
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
