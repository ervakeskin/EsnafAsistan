import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { PosClient } from "./pos-client"

type Product = {
  id: string
  name: string
  quantity: number
  unit: string
  purchase_price: number
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export default async function PosPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("id, name, quantity, unit, purchase_price")
    .gt("quantity", 0)
    .order("name", { ascending: true })

  const products = (data ?? []) as Product[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Kasa", href: "/dashboard/kasa" }, { label: "Hızlı Satış" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Hızlı Satış (POS)</h1>
        <p className="mt-2 text-base text-muted-foreground">Dokunmatik ekran için optimize edilmiş satış arayüzü.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-xl">Ürünler</CardTitle></CardHeader>
            <CardContent>
              <PosClient
                products={products.map(p => ({
                  id: p.id,
                  name: p.name,
                  quantity: p.quantity,
                  unit: p.unit,
                  purchasePrice: Number(p.purchase_price),
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
