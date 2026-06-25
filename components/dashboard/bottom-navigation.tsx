"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Boxes, CalendarClock, Wallet, BarChart3, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Özet", icon: LayoutDashboard },
  { href: "/dashboard/stok", label: "Stok", icon: Boxes },
  { href: "/dashboard/kasa", label: "Kasa", icon: Wallet },
  { href: "/dashboard/teslimatlar", label: "Teslimat", icon: CalendarClock },
  { href: "/dashboard/musteri-cari", label: "Cari", icon: Users },
  { href: "/dashboard/raporlar", label: "Rapor", icon: BarChart3 },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 text-[11px] font-medium transition-colors min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("size-5", isActive && "fill-primary/10")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
