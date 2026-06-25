import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

function getTodayRange() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)
  const year = Number(parts.find(p => p.type === "year")?.value)
  const month = Number(parts.find(p => p.type === "month")?.value)
  const day = Number(parts.find(p => p.type === "day")?.value)
  const start = new Date(Date.UTC(year, month - 1, day, -3, 0, 0, 0))
  return { start: start.toISOString(), end: new Date(start.getTime() + 86400000).toISOString() }
}

type SaleRow = {
  id: string
  quantity: number
  sale_price: number
  purchase_price: number
  payment_type: string
  customer_name: string | null
  sold_at: string
  products: { name: string }[] | null
}

export default async function GunSonuRaporuPage() {
  const { start, end } = getTodayRange()
  const supabase = await createClient()
  const { data } = await supabase
    .from("sales")
    .select("id, quantity, sale_price, purchase_price, customer_name, sold_at, products(name)")
    .gte("sold_at", start)
    .lt("sold_at", end)
    .order("sold_at", { ascending: false })

  const sales = (data ?? []) as SaleRow[]
  const totalRevenue = sales.reduce((s, r) => s + Number(r.sale_price) * Number(r.quantity), 0)
  const totalProfit = sales.reduce((s, r) => s + (Number(r.sale_price) - Number(r.purchase_price)) * Number(r.quantity), 0)
  const totalCost = sales.reduce((s, r) => s + Number(r.purchase_price) * Number(r.quantity), 0)

  const nakit = sales.filter(s => s.payment_type === "nakit").reduce((s, r) => s + Number(r.sale_price) * Number(r.quantity), 0)
  const kart = sales.filter(s => s.payment_type === "kart").reduce((s, r) => s + Number(r.sale_price) * Number(r.quantity), 0)

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Kasa", href: "/dashboard/kasa" }, { label: "Gün Sonu Raporu" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Gün Sonu Raporu (Z Raporu)</h1>
        <p className="mt-2 text-base text-muted-foreground">Bugünkü tüm satış özeti.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Satış</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Maliyet</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{formatPrice(totalCost)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Kâr</CardTitle></CardHeader>
          <CardContent><p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-success" : "text-danger"}`}>{formatPrice(totalProfit)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">İşlem Sayısı</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{sales.length}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Ödeme Türü Dağılımı</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base">Nakit</span>
              <span className="text-lg font-bold">{formatPrice(nakit)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base">Kart</span>
              <span className="text-lg font-bold">{formatPrice(kart)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-base font-semibold">Toplam</span>
              <span className="text-lg font-bold">{formatPrice(nakit + kart)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">İşlem Detayı</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saat</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-base">Bugün satış kaydı yok.</TableCell></TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Intl.DateTimeFormat("tr-TR", { timeStyle: "short" }).format(new Date(sale.sold_at))}</TableCell>
                    <TableCell className="font-semibold">{sale.products?.[0]?.name ?? "Silinmiş"}</TableCell>
                    <TableCell>{sale.customer_name ?? "—"}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(Number(sale.sale_price) * Number(sale.quantity))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="h-12 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground hover:brightness-110"
        >
          Raporu Yazdır
        </button>
      </div>
    </section>
  )
}
