"use client"

import { Button } from "@/components/ui/button"

type RootErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Uygulama şu an yüklenemedi</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {error?.message ?? "Beklenmeyen bir hata oluştu."}
        </p>
        <p className="mt-3 rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground">
          Hata detayı: {error.message || "Bilinmeyen hata"}
        </p>
        <Button type="button" className="mt-4 h-11 text-base" onClick={reset}>
          Tekrar Dene
        </Button>
      </div>
    </main>
  )
}
