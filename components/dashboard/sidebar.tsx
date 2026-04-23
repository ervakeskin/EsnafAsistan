"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Boxes,
  CalendarClock,
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

const menuItems = [
  {
    href: "/dashboard",
    label: "Dükkan Özeti",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/stok",
    label: "Mallar & Depolar",
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
    href: "/dashboard/ayarlar",
    label: "Ayarlar",
    icon: MailPlus,
  },
]

function SidebarLinks() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "default" : "ghost", size: "lg" }),
              "h-12 w-full justify-start gap-3 text-base",
            )}
          >
            <item.icon className="size-5" />
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
      <aside className="hidden h-screen w-72 border-r bg-card p-5 lg:block">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            EsnafAsistan
          </p>
          <h2 className="text-2xl font-semibold">Yönetim Paneli</h2>
        </div>

        <SidebarLinks />

        <Separator className="my-6" />

        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full justify-start gap-3 text-base"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          Çıkış Yap
        </Button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            EsnafAsistan
          </p>
          <p className="text-lg font-semibold">Yönetim Paneli</p>
        </div>

        <Sheet>
          <SheetTrigger className={buttonVariants({ variant: "outline", size: "icon-lg" })}>
            <Menu className="size-5" />
          </SheetTrigger>

          <SheetContent className="w-[88%] p-5">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                EsnafAsistan
              </p>
              <h3 className="text-xl font-semibold">Menüler</h3>
            </div>

            <SidebarLinks />
            <Separator className="my-6" />
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full justify-start gap-3 text-base"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
              Çıkış Yap
            </Button>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
