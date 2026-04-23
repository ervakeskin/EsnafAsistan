"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AuthMode = "signin" | "signup"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMessage("Şifre tekrarı eşleşmiyor.")
      return
    }

    setIsLoading(true)

    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup"
      const response = await fetch(endpoint, {
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

      if (mode === "signup") {
        setSuccessMessage(message)
        setMode("signin")
        setPassword("")
        setConfirmPassword("")
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
          <h1 className="text-4xl font-semibold text-slate-900">Dükkanını tek panelden yönet.</h1>
          <p className="text-lg text-slate-600">Sipariş, stok, teslimat ve kasa takibini sade bir panelle anında gör.</p>
        </section>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Hesabına Eriş</CardTitle>
            <p className="text-base text-muted-foreground">Giriş yap veya yeni hesap oluştur.</p>
          </CardHeader>

          <CardContent className="space-y-5">
            <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)} className="w-full">
              <TabsList className="grid h-12 w-full grid-cols-2">
                <TabsTrigger value="signin" className="text-base">
                  Giriş Yap
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-base">
                  Kayıt Ol
                </TabsTrigger>
              </TabsList>

              <TabsContent value={mode} className="mt-5">
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
                        placeholder="ornek@dukkan.com"
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

                  {mode === "signup" ? (
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
                  ) : null}

                  {errorMessage ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  ) : null}

                  {successMessage ? (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {successMessage}
                    </p>
                  ) : null}

                  <Button className="h-12 w-full text-base" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        İşlem sürüyor
                      </>
                    ) : mode === "signin" ? (
                      "Panele Giriş Yap"
                    ) : (
                      "Yeni Hesap Oluştur"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
