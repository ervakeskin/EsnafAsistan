import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

type SupplierRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
  performance_score: number | null
  is_active: boolean
}

export default async function TedarikcilerPage() {
  const supabase = await createClient()
  const { data } = await supabase.from("suppliers").select("*").order("name", { ascending: true })
  const suppliers = (data ?? []) as SupplierRow[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Tedarikçiler" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Tedarikçi Yönetimi</h1>
        <p className="mt-2 text-base text-muted-foreground">Tedarikçi iletişim bilgileri, performans puanı ve sipariş geçmişi.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Tedarikçi Listesi</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Performans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-base text-muted-foreground">Henüz tedarikçi kaydı yok.</TableCell>
                </TableRow>
              ) : (
                suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell>{s.phone ?? "-"}</TableCell>
                    <TableCell>{s.email ?? "-"}</TableCell>
                    <TableCell>
                      {s.performance_score != null ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${
                          s.performance_score >= 80 ? "bg-success-bg text-success" :
                          s.performance_score >= 50 ? "bg-warning-bg text-warning" :
                          "bg-danger-bg text-danger"
                        }`}>
                          %{s.performance_score}
                        </span>
                      ) : "—"}
                    </TableCell>
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
