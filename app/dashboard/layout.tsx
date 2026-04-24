import { Sparkles } from "lucide-react"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { isSupabaseConfigError } from "@/lib/auth/messages"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  try {
    const supabase = await createClient()
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

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-end">
            <Button variant="outline" size="lg" className="h-11 text-base">
              <Sparkles className="size-4" />
              Yardım / AI Önerisi
            </Button>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
