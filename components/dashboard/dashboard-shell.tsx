"use client"

import { Settings2 } from "lucide-react"
import Link from "next/link"
import { AiChatProvider } from "@/components/dashboard/ai-chat-provider"
import { AiChatDrawer, AiChatTrigger } from "@/components/dashboard/ai-chat"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/dashboard/back-button"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AiChatProvider>
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <BackButton />
          <div className="flex items-center gap-2">
            <Link href="/dashboard/hesap-ayarlari">
              <Button variant="outline" size="lg" className="h-11 text-base">
                <Settings2 className="size-4" />
                Hesap
              </Button>
            </Link>
            {/* Yardım butonu artık AI drawer'ı açıyor */}
            <AiChatTrigger variant="header" />
          </div>
        </div>
        <div className="page-enter">{children}</div>
      </div>

      {/* Drawer — sadece bir kez render edilir, her yerden açılabilir */}
      <AiChatDrawer />
    </AiChatProvider>
  )
}
