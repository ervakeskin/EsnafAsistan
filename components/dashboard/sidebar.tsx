"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Boxes,
  CalendarClock,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Menu,
  Users,
  Truck,
  Phone,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { AiChat } from "./ai-chat"

const menuItems = [
  {
    href: "/dashboard",
    label: "Dükkan Özeti",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/stok",
    label: "Mallar ve Depolar",
    icon: Boxes,
  },
  {
    href: "/dashboard/teslimatlar",
    label: "Teslimat Takvimi",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/kasa",
    label: "Kasa",
    icon: Wallet,
  },
  {
    href: "/dashboard/musteri-cari",
    label: "Müşteri Cari",
    icon: Users,
  },
  {
    href: "/dashboard/tedarikciler",
    label: "Tedarikçiler",
    icon: Truck,
  },
  {
    href: "/dashboard/raporlar",
    label: "Raporlar",
    icon: BarChart3,
  },
  {
    href: "/dashboard/ayarlar",
    label: "Ayarlar",
    icon: MailPlus,
  },
  {
    href: "/dashboard/yardim",
    label: "Yardım ve Öneriler",
    icon: HelpCircle,
  },
]

function SidebarLinks() {
  const pathname = usePathname()

  return (
    <nav className="space-y-0.5 py-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardSidebar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/")
    router.refresh()
  }

  return (
    <>
      <aside className="hidden h-screen w-[220px] bg-sidebar shrink-0 lg:flex lg:flex-col [box-shadow:1px_0_0_0_rgba(0,0,0,0.06)] dark:[box-shadow:1px_0_0_0_rgba(255,255,255,0.06)]">
        <div className="p-5 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            EsnafAsistan
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Yönetim Paneli</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <SidebarLinks />
        </div>

        <div className="p-3 pb-5 space-y-1 [border-top:1px_solid_rgba(0,0,0,0.06)] dark:[border-top:1px_solid_rgba(255,255,255,0.06)]">
          <AiChat />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="lg"
            className="h-10 w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between bg-background/80 backdrop-blur-md px-4 py-3 lg:hidden [box-shadow:0_1px_0_0_rgba(0,0,0,0.06)] dark:[box-shadow:0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
            EsnafAsistan
          </p>
          <p className="text-base font-semibold tracking-tight text-foreground">Yönetim Paneli</p>
        </div>

        <Sheet>
          <SheetTrigger className="flex size-10 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.10] transition-colors">
            <Menu className="size-5" />
          </SheetTrigger>

          <SheetContent className="w-[88%] p-5 flex flex-col">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                EsnafAsistan
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight">Menüler</h3>
            </div>

            <div className="flex-1">
              <SidebarLinks />
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full justify-start gap-3 text-base"
                onClick={handleLogout}
              >
                <LogOut className="size-5" />
                Çıkış Yap
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
