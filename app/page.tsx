"use client"

import type { FormEvent } from "react"
import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LoaderCircle, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusAlert } from "@/components/ui/status-alert"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const durum = searchParams.get("durum")

  const statusInfoMessage = useMemo(() => {
    const infoMessageByStatus: Record<string, string> = {
      "kayit-basarili": "Kayıt başarılı. Lütfen e-postanı onaylayarak giriş yap.",
      "sistem-ayari-hatasi":
        "Sistem ayarlarında bağlantı sorunu var. Lütfen biraz sonra tekrar deneyin veya yöneticinle iletişime geç.",
    }
    return durum ? infoMessageByStatus[durum] : undefined
  }, [durum])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      const message = payload?.message ?? "Beklenmeyen bir hata oluştu."

      if (!response.ok) {
        setErrorMessage(message)
        return
      }

      setSuccessMessage(message)
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(`Giriş sırasında bir bağlantı sorunu oluştu: ${error.message}`)
        return
      }

      setErrorMessage("Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2">
        <section className="hidden space-y-4 md:block">
          <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
            EsnafAsistan
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">Dükkanınızı tek bir noktadan yönetin.</h1>
          <p className="text-lg text-slate-600">Sipariş, stok, teslimat ve kasa takibini sade bir panelde anında görün.</p>
        </section>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
            <p className="text-base text-muted-foreground">E-posta ve şifrenle paneline güvenli şekilde gir.</p>
          </CardHeader>

          <CardContent className="space-y-5">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  E-posta
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    placeholder="örnek@dukkan.com"
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 pl-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    placeholder="********"
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 pl-11 text-base"
                  />
                </div>
              </div>

              {errorMessage ? <StatusAlert message={errorMessage} variant="error" /> : null}

              {!errorMessage && successMessage ? <StatusAlert message={successMessage} variant="success" /> : null}

              {!errorMessage && !successMessage && statusInfoMessage ? (
                <StatusAlert message={statusInfoMessage} variant="info" />
              ) : null}

              <Button type="submit" className="h-12 w-full text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Giriş yapılıyor
                  </>
                ) : (
                  "Panele Giriş Yap"
                )}
              </Button>
            </form>

            <div className="text-center text-base text-slate-600">
              Hesabın yok mu?{" "}
              <Link href="/kayit-ol" className="font-semibold text-slate-900 underline underline-offset-4">
                Kayıt Ol
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
