"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (password !== confirmPassword) {
      setErrorMessage("Şifre tekrarı eşleşmiyor.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      const message = payload?.message ?? "Beklenmeyen bir hata oluştu."

      if (!response.ok) {
        setErrorMessage(message)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
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
          <h1 className="text-4xl font-semibold text-slate-900">Yeni hesap aç, panelini hemen kullan.</h1>
          <p className="text-lg text-slate-600">E-posta ve şifre ile kayıt ol, ardından doğrudan dükkan paneline geç.</p>
        </section>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
            <p className="text-base text-muted-foreground">Yeni bir hesap oluşturarak EsnafAsistan&apos;ı kullanmaya başla.</p>
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-base">
                  Şifre Tekrar
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 size-5 text-slate-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    placeholder="********"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-12 pl-11 text-base"
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <Button className="h-12 w-full text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Kayıt oluşturuluyor
                  </>
                ) : (
                  "Hesap Oluştur"
                )}
              </Button>
            </form>

            <div className="text-center text-base text-slate-600">
              Zaten hesabın var mı?{" "}
              <Link href="/" className="font-semibold text-slate-900 underline underline-offset-4">
                Giriş Yap
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
