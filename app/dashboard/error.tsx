"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="size-5 text-amber-600" />
            Dashboard yüklenemedi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-slate-700">
            Sayfa yüklenirken beklenmeyen bir sorun oluştu. Lütfen tekrar dene.
          </p>
          <p className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Hata detayı: {error.message || "Bilinmeyen hata"}
          </p>
          <Button type="button" className="h-11 text-base" onClick={reset}>
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
