import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value))
}

type BatchRow = {
  id: string
  batch_code: string | null
  quantity: number
  expiry_date: string | null
  purchase_price: number | null
  products: { name: string }[] | null
  warehouses: { name: string }[] | null
}

export default async function PartiTakibiPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("batch_tracking")
    .select("id, batch_code, quantity, expiry_date, purchase_price, products(name), warehouses(name)")
    .order("expiry_date", { ascending: true, nullsFirst: false })

  const batches = (data ?? []) as BatchRow[]
  const expired = batches.filter((b) => b.expiry_date && new Date(b.expiry_date) < new Date())
  const expiringSoon = batches.filter((b) => {
    if (!b.expiry_date) return false
    const daysLeft = Math.ceil((new Date(b.expiry_date).getTime() - Date.now()) / 86400000)
    return daysLeft >= 0 && daysLeft <= 30
  })

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Stok", href: "/dashboard/stok" }, { label: "Parti ve SKT Takibi" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Parti ve Son Kullanma Tarihi Takibi</h1>
        <p className="mt-2 text-base text-muted-foreground">Özellikle gıda ve ilaç sektörü için parti bazlı stok yönetimi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Parti</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{batches.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">Süresi Geçen</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-danger">{expired.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-warning">30 Gün İçinde Biten</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-warning">{expiringSoon.length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Parti Listesi</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>Parti Kodu</TableHead>
                <TableHead>Miktar</TableHead>
                <TableHead>Depo</TableHead>
                <TableHead>SKT</TableHead>
                <TableHead>Alış Fiyatı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-base text-muted-foreground">Henüz parti kaydı yok.</TableCell></TableRow>
              ) : (
                batches.map((batch) => {
                  const isExpired = batch.expiry_date && new Date(batch.expiry_date) < new Date()
                  const isExpiringSoon = batch.expiry_date && !isExpired && Math.ceil((new Date(batch.expiry_date).getTime() - Date.now()) / 86400000) <= 30
                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-semibold">{batch.products?.[0]?.name ?? "Silinmiş"}</TableCell>
                      <TableCell>{batch.batch_code ?? "—"}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{batch.warehouses?.[0]?.name ?? "—"}</TableCell>
                      <TableCell>
                        {batch.expiry_date ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
                            isExpired ? "bg-danger-bg text-danger" :
                            isExpiringSoon ? "bg-warning-bg text-warning" :
                            "bg-success-bg text-success"
                          }`}>
                            {formatDate(batch.expiry_date)}
                            {isExpired && " (Süresi geçti)"}
                            {isExpiringSoon && " (Yakında)"}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell>{batch.purchase_price ? formatPrice(batch.purchase_price) : "—"}</TableCell>
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
