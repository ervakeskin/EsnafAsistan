"use client"

import { Boxes, CalendarPlus, Wallet } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    href: "/dashboard/stok",
    label: "Yeni Ürün Ekle",
    description: "Stokuna yeni bir mal ekle",
    icon: Boxes,
    gradient: "from-blue-500 to-purple-600",
  },
  {
    href: "/dashboard/kasa",
    label: "Gelir & Gider",
    description: "Kasa hareketi ekle",
    icon: Wallet,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/dashboard/teslimatlar",
    label: "Teslimat Ekle",
    description: "Yeni bir teslimat kaydı oluştur",
    icon: CalendarPlus,
    gradient: "from-amber-500 to-orange-600",
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-foreground/5 hover:ring-foreground/20 transition-all hover:-translate-y-0.5"
        >
          <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${action.gradient}`} />
          <div className="relative">
            <div className={`inline-flex rounded-lg bg-gradient-to-br ${action.gradient} p-2.5 text-white`}>
              <action.icon className="size-5" />
            </div>
            <p className="mt-3 text-base font-semibold">{action.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
