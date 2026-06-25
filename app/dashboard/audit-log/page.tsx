import { Breadcrumb } from "@/components/dashboard/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
}

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  insert: { label: "Ekleme", className: "bg-success-bg text-success" },
  update: { label: "Güncelleme", className: "bg-blue-100 text-blue-800" },
  delete: { label: "Silme", className: "bg-danger-bg text-danger" },
}

type AuditLogRow = {
  id: string
  table_name: string
  action: string
  changed_at: string
  record_id: string
}

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("audit_log")
    .select("id, table_name, action, changed_at, record_id")
    .order("changed_at", { ascending: false })
    .limit(200)

  const logs = (data ?? []) as AuditLogRow[]

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ label: "Ana Sayfa", href: "/dashboard" }, { label: "Denetim Günlüğü" }]} />
      <div>
        <h1 className="text-3xl font-semibold">Denetim Günlüğü</h1>
        <p className="mt-2 text-base text-muted-foreground">Sistemdeki tüm değişikliklerin kaydı.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-xl">Son 200 İşlem</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Tablo</TableHead>
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="py-8 text-center text-base text-muted-foreground">Henüz kayıt yok.</TableCell></TableRow>
              ) : (
                logs.map((log) => {
                  const meta = ACTION_LABELS[log.action] ?? { label: log.action, className: "bg-muted text-foreground" }
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.changed_at)}</TableCell>
                      <TableCell className="font-semibold">{log.table_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium ${meta.className}`}>
                          {meta.label}
                        </span>
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
