"use client"

import { Boxes, CalendarPlus, Wallet } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    href: "/dashboard/stok",
    label: "Yeni Ürün Ekle",
    description: "Depona yeni bir ürün ekle",
    icon: Boxes,
    iconBg: "bg-[#0071e3]/10",
    iconColor: "text-[#0071e3]",
  },
  {
    href: "/dashboard/kasa",
    label: "Gelir & Gider",
    description: "Kasa hareketi ekle",
    icon: Wallet,
    iconBg: "bg-[#248a3d]/10",
    iconColor: "text-[#248a3d]",
  },
  {
    href: "/dashboard/teslimatlar",
    label: "Teslimat Ekle",
    description: "Yeni bir teslimat kaydı oluştur",
    icon: CalendarPlus,
    iconBg: "bg-[#9a6e1a]/10",
    iconColor: "text-[#9a6e1a]",
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.05] dark:ring-white/[0.08] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`inline-flex items-center justify-center size-10 rounded-xl ${action.iconBg}`}>
            <action.icon className={`size-5 ${action.iconColor}`} />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">{action.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
        </Link>
      ))}
    </div>
  )
}
