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

const ACCENTS = [
  "bg-danger/50",
  "bg-primary/50",
  "bg-success/50",
]

export function PageShell({ title, description, stats }: PageShellProps) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-base text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item, idx) => (
          <Card key={item.label} className="overflow-hidden">
            <div className={`h-1 ${ACCENTS[idx % ACCENTS.length]}`} />
            <CardContent className="p-6 pt-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground/70 leading-relaxed">
                {item.helper}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
