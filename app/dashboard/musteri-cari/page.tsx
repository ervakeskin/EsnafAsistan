import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

type CustomerRow = {
  id: string
  customer_name: string
  total_debt: number
  total_credit: number
  balance: number
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)
}

export default async function MusteriCariPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("customer_ledger")
    .select("*")
    .order("customer_name", { ascending: true })

  const customers = (data ?? []) as CustomerRow[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Müşteri Cari" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Müşteri Cari Hesabı</h1>
        <p className="mt-2 text-base text-muted-foreground">Müşteri bazlı borç/alacak takibi yapın.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Müşteri</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customers.length} kişi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Borç</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-danger">{formatPrice(customers.reduce((s, c) => s + c.total_debt, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base text-muted-foreground">Toplam Alacak</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{formatPrice(customers.reduce((s, c) => s + c.total_credit, 0))}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Müşteri Listesi</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {customers.length === 0 ? (
              <p className="py-8 text-center text-base text-muted-foreground">Henüz müşteri kaydı yok.</p>
            ) : (
              customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-base font-semibold">{customer.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Borç: {formatPrice(customer.total_debt)} | Ödeme: {formatPrice(customer.total_credit)}
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${customer.balance > 0 ? "text-danger" : "text-success"}`}>
                    {customer.balance > 0 ? `${formatPrice(customer.balance)} borç` : `${formatPrice(Math.abs(customer.balance))} alacak`}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
