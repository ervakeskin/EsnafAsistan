import { AlertTriangle, Award, TrendingUp, Truck } from "lucide-react"

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

// Eşik altı sayılacak kritik stok seviyesi
const CRITICAL_STOCK_THRESHOLD = 5

type SaleRow = {
  quantity: number
  sale_price: number
  purchase_price: number
  sold_at: string
  products: { name: string }[] | null
}

type ProductRow = {
  id: string
  name: string
  quantity: number
  unit: string
  warehouse: string | null
}

type DeliveryRow = {
  supplier_name: string
  status: "bekliyor" | "teslim-alindi" | "iptal"
  expected_date: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

// Belirtilen gün kadar geriye giden ISO tarih döndürür (gün başlangıcı)
function isoDaysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default async function RaporlarPage() {
  const supabase = await createClient()

  const [{ data: sales, error: salesError }, { data: products }, { data: deliveries }] =
    await Promise.all([
      supabase
        .from("sales")
        .select("quantity, sale_price, purchase_price, sold_at, products(name)")
        .gte("sold_at", isoDaysAgo(30)),
      supabase.from("products").select("id, name, quantity, unit, warehouse").order("quantity", { ascending: true }),
      supabase.from("deliveries").select("supplier_name, status, expected_date"),
    ])

  if (salesError) {
    console.error("Rapor verileri yüklenemedi:", salesError.message)
  }

  const saleRows = (sales ?? []) as SaleRow[]
  const productRows = (products ?? []) as ProductRow[]
  const deliveryRows = (deliveries ?? []) as DeliveryRow[]

  const weekStart = isoDaysAgo(7)

  // 3.1 — Haftalık ve aylık kâr özeti (son 7 ve 30 gün)
  const lineProfit = (sale: SaleRow) =>
    (Number(sale.sale_price) - Number(sale.purchase_price)) * Number(sale.quantity)
  const lineRevenue = (sale: SaleRow) => Number(sale.sale_price) * Number(sale.quantity)

  const monthlyProfit = saleRows.reduce((sum, sale) => sum + lineProfit(sale), 0)
  const monthlyRevenue = saleRows.reduce((sum, sale) => sum + lineRevenue(sale), 0)
  const weeklySales = saleRows.filter((sale) => sale.sold_at >= weekStart)
  const weeklyProfit = weeklySales.reduce((sum, sale) => sum + lineProfit(sale), 0)
  const weeklyRevenue = weeklySales.reduce((sum, sale) => sum + lineRevenue(sale), 0)

  // 3.2 — En çok satan ürünler (adet bazında)
  const productSales = new Map<string, { name: string; quantity: number; profit: number }>()
  for (const sale of saleRows) {
    const name = sale.products?.[0]?.name ?? "Silinmiş Ürün"
    const current = productSales.get(name) ?? { name, quantity: 0, profit: 0 }
    current.quantity += Number(sale.quantity)
    current.profit += lineProfit(sale)
    productSales.set(name, current)
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // 3.3 — Kritik stok raporu (eşik altı ürünler)
  const criticalProducts = productRows.filter(
    (product) => Number(product.quantity) <= CRITICAL_STOCK_THRESHOLD,
  )

  // 3.4 — Tedarikçi bazlı teslimat performansı
  const today = todayIso()
  const supplierStats = new Map<
    string,
    { name: string; total: number; delivered: number; delayed: number }
  >()
  for (const delivery of deliveryRows) {
    const name = delivery.supplier_name?.trim() || "Bilinmeyen"
    const current = supplierStats.get(name) ?? { name, total: 0, delivered: 0, delayed: 0 }
    current.total += 1
    if (delivery.status === "teslim-alindi") current.delivered += 1
    if (delivery.status === "bekliyor" && delivery.expected_date && delivery.expected_date < today) {
      current.delayed += 1
    }
    supplierStats.set(name, current)
  }
  const supplierRows = Array.from(supplierStats.values()).sort((a, b) => b.total - a.total)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Raporlar ve Analiz</h1>
        <p className="mt-2 text-base text-slate-600">
          Son 30 günün satış, stok ve teslimat performansını tek ekranda incele.
        </p>
      </div>

      {/* 3.1 Haftalık / aylık kâr özeti */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bu Hafta Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{formatPrice(weeklyRevenue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Son 7 gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bu Hafta Kâr</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-700">{formatPrice(weeklyProfit)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Cepte kalan (son 7 gün)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bu Ay Ciro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-900">{formatPrice(monthlyRevenue)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Son 30 gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-600">Bu Ay Kâr</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-700">{formatPrice(monthlyProfit)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Cepte kalan (son 30 gün)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 3.2 En çok satan ürünler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="size-5 text-amber-500" />
              En Çok Satan Ürünler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Ürün</TableHead>
                  <TableHead className="text-base">Satılan Adet</TableHead>
                  <TableHead className="text-base">Kâr</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-base text-slate-500">
                      Son 30 günde satış kaydı yok.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="text-base font-semibold">{product.name}</TableCell>
                      <TableCell className="text-base">{product.quantity}</TableCell>
                      <TableCell className="text-base font-semibold text-emerald-700">
                        {formatPrice(product.profit)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 3.3 Kritik stok raporu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="size-5 text-red-500" />
              Kritik Stok ({CRITICAL_STOCK_THRESHOLD} ve altı)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">Ürün</TableHead>
                  <TableHead className="text-base">Depo</TableHead>
                  <TableHead className="text-base">Kalan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-base text-slate-500">
                      Kritik seviyede ürün yok. 👍
                    </TableCell>
                  </TableRow>
                ) : (
                  criticalProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-base font-semibold">{product.name}</TableCell>
                      <TableCell className="text-base">{product.warehouse ?? "-"}</TableCell>
                      <TableCell className="text-base font-semibold text-red-600">
                        {product.quantity} {product.unit}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 3.4 Tedarikçi bazlı teslimat performansı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Truck className="size-5 text-slate-500" />
            Tedarikçi Teslimat Performansı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Tedarikçi</TableHead>
                <TableHead className="text-base">Toplam Sipariş</TableHead>
                <TableHead className="text-base">Teslim Alınan</TableHead>
                <TableHead className="text-base">Geciken</TableHead>
                <TableHead className="text-base">Başarı Oranı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-base text-slate-500">
                    Henüz teslimat kaydı yok.
                  </TableCell>
                </TableRow>
              ) : (
                supplierRows.map((supplier) => {
                  const successRate =
                    supplier.total > 0 ? Math.round((supplier.delivered / supplier.total) * 100) : 0
                  return (
                    <TableRow key={supplier.name}>
                      <TableCell className="text-base font-semibold">{supplier.name}</TableCell>
                      <TableCell className="text-base">{supplier.total}</TableCell>
                      <TableCell className="text-base text-emerald-700">{supplier.delivered}</TableCell>
                      <TableCell className="text-base text-red-600">{supplier.delayed}</TableCell>
                      <TableCell className="flex items-center gap-1 text-base font-semibold">
                        <TrendingUp className="size-4 text-slate-400" />%{successRate}
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
