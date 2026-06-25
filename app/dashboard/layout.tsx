import { redirect } from "next/navigation"

import { AddCenterFab } from "@/components/dashboard/add-center-fab"
import { BottomNavigation } from "@/components/dashboard/bottom-navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { isSupabaseConfigError } from "@/lib/auth/messages"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let supabase: Awaited<ReturnType<typeof createClient>>

  try {
    supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/")
    }
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      redirect("/?durum=sistem-ayari-hatasi")
    }

    redirect("/")
  }

  const { data: warehouseRows } = await supabase
    .from("warehouses")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true })

  const warehouses = (warehouseRows ?? []) as Array<{ id: string; name: string }>

  return (
    <div className="min-h-screen bg-background lg:flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-base focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        İçeriğe atla
      </a>

      <DashboardSidebar />

      <main id="main-content" className="flex-1">
        {/* DashboardShell: AiChatProvider + Yardım butonu + AiChatDrawer */}
        <DashboardShell>{children}</DashboardShell>
      </main>

      <AddCenterFab warehouses={warehouses} />
      <BottomNavigation />
    </div>
  )
}
