import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <DashboardSidebar />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="mb-5 flex items-center justify-end">
            <Button variant="outline" size="lg" className="h-11 text-base">
              <Sparkles className="size-4" />
              Yardim / AI Onerisi
            </Button>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
