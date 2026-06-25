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
  Wallet,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

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
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "default" : "ghost", size: "lg" }),
              "h-12 w-full justify-start gap-3 text-base relative",
              isActive && "shadow-sm",
            )}
          >
            <item.icon className="size-5 shrink-0" />
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
      <aside className="hidden h-screen w-72 border-r bg-sidebar p-5 lg:flex lg:flex-col">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            EsnafAsistan
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Yönetim Paneli</h2>
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
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            EsnafAsistan
          </p>
          <p className="text-lg font-bold tracking-tight">Yönetim Paneli</p>
        </div>

        <Sheet>
          <SheetTrigger className={buttonVariants({ variant: "outline", size: "icon-lg" })}>
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
