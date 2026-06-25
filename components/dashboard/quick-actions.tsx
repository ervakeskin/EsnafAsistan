"use client"

import { Boxes, CalendarPlus, Wallet } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    href: "/dashboard/stok",
    label: "Yeni Ürün Ekle",
    description: "Depona yeni bir ürün ekle",
    icon: Boxes,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/kasa",
    label: "Gelir & Gider",
    description: "Kasa hareketi ekle",
    icon: Wallet,
    iconClass: "bg-success/10 text-success",
  },
  {
    href: "/dashboard/teslimatlar",
    label: "Teslimat Ekle",
    description: "Yeni bir teslimat kaydı oluştur",
    icon: CalendarPlus,
    iconClass: "bg-warning/10 text-warning",
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
        >
          <div className="relative">
            <div className={`inline-flex rounded-lg ${action.iconClass} p-2.5`}>
              <action.icon className="size-5" />
            </div>
            <p className="mt-3 text-base font-semibold">{action.label}</p>
            <p className="mt-1 text-sm text-muted-foreground/70">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
