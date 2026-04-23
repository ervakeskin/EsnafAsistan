import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatCard = {
  label: string
  value: string
  helper: string
}

type PageShellProps = {
  title: string
  description: string
  stats: StatCard[]
}

export function PageShell({ title, description, stats }: PageShellProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-base text-slate-600">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
