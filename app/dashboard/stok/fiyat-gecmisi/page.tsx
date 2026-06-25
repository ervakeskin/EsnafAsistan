import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
}

type PriceHistoryRow = {
  id: string
  old_price: number | null
  new_price: number
  change_reason: string | null
  created_at: string
  products: { name: string }[] | null
}

export default async function FiyatGecmisiPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("price_history")
    .select("id, old_price, new_price, change_reason, created_at, products(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  const history = (data ?? []) as PriceHistoryRow[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Stok", href: "/dashboard/stok" }, { label: "Fiyat Geçmişi" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Fiyat Geçmişi</h1>
        <p className="mt-2 text-base text-muted-foreground">Ürün alış fiyatı değişimlerinin kaydı.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Son 100 Değişiklik</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Eski Fiyat</TableHead>
                <TableHead>Yeni Fiyat</TableHead>
                <TableHead>Sebep</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-base text-muted-foreground">Henüz fiyat değişikliği kaydı yok.</TableCell>
                </TableRow>
              ) : (
                history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{formatDateTime(h.created_at)}</TableCell>
                    <TableCell className="font-semibold">{h.products?.[0]?.name ?? "Silinmiş Ürün"}</TableCell>
                    <TableCell>{h.old_price != null ? formatPrice(h.old_price) : "—"}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(h.new_price)}</TableCell>
                    <TableCell className="text-muted-foreground">{h.change_reason ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
