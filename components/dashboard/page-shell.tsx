import { Card, CardContent } from "@/components/ui/card"

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
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1.5 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {item.label}
              </p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {item.helper}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
