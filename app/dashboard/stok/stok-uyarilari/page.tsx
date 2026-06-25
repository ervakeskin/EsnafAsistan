import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

type StockAlertRow = {
  id: string
  threshold_quantity: number
  is_active: boolean
  last_notified_at: string | null
  created_at: string
  products: { name: string; quantity: number; unit: string }[] | null
}

export default async function StokUyarilariPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("stock_alerts")
    .select("id, threshold_quantity, is_active, last_notified_at, created_at, products(name, quantity, unit)")
    .order("created_at", { ascending: false })

  const alerts = (data ?? []) as StockAlertRow[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Stok", href: "/dashboard/stok" }, { label: "Stok Uyarıları" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Stok Uyarıları</h1>
        <p className="mt-2 text-base text-muted-foreground">Kritik seviyedeki ürünler için otomatik uyarılar.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Kritik Stok Uyarıları</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Eşik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Bildirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-base text-muted-foreground">Kritik stok uyarısı bulunmuyor.</TableCell></TableRow>
              ) : (
                alerts.map((alert) => {
                  const product = alert.products?.[0]
                  const isCritical = product && product.quantity <= alert.threshold_quantity
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-semibold">{product?.name ?? "Silinmiş Ürün"}</TableCell>
                      <TableCell>
                        <span className={isCritical ? "text-danger font-bold" : "text-success"}>
                          {product?.quantity ?? "?"} {product?.unit ?? ""}
                        </span>
                      </TableCell>
                      <TableCell>{alert.threshold_quantity}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
                          isCritical ? "bg-danger-bg text-danger" : "bg-success-bg text-success"
                        }`}>
                          {isCritical ? "Kritik" : "Normal"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {alert.last_notified_at
                          ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(alert.last_notified_at))
                          : "Henüz bildirim gönderilmedi"}
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
