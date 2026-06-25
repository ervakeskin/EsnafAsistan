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

const GRADIENTS = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
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
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                {item.label}
              </p>
              <p className={`mt-2 text-4xl font-bold bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} bg-clip-text text-transparent`}>
                {item.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.helper}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
