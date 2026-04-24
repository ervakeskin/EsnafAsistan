"use client"

import { Button } from "@/components/ui/button"

type RootErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Uygulama şu an yüklenemedi</h1>
        <p className="mt-2 text-base text-slate-600">
          Geçici bir sorun oluştu. Lütfen tekrar dene.
        </p>
        <p className="mt-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Hata detayı: {error.message || "Bilinmeyen hata"}
        </p>
        <Button type="button" className="mt-4 h-11 text-base" onClick={reset}>
          Tekrar Dene
        </Button>
      </div>
    </main>
  )
}
