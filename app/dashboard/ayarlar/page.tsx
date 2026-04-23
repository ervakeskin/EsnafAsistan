"use client"

import { FormEvent, useState } from "react"
import { Mail, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialEmails = ["siparis@dukkan.com", "tedarik@dukkan.com"]

export default function AyarlarPage() {
  const [email, setEmail] = useState("")
  const [emails, setEmails] = useState(initialEmails)
  const [error, setError] = useState("")

  function handleAddEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim().toLowerCase()

    if (!value.includes("@")) {
      setError("Gecerli bir mail adresi gir.")
      return
    }

    if (emails.includes(value)) {
      setError("Bu mail zaten listede var.")
      return
    }

    setEmails((prev) => [value, ...prev])
    setEmail("")
    setError("")
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="mt-2 text-base text-slate-600">
          Siparis ve teslimat maillerini okuyacak ek hesaplari buradan bagla.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mail Entegrasyon Altyapisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleAddEmail} className="space-y-3">
            <Label htmlFor="new-mail" className="text-base">
              Yeni Mail Adresi Ekle
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="new-mail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@firma.com"
                className="h-12 text-base"
              />
              <Button size="lg" className="h-12 text-base">
                <Plus className="size-4" />
                Mail Ekle
              </Button>
            </div>
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </form>

          <div className="space-y-3">
            {emails.map((item) => (
              <div
                key={item}
                className="flex flex-col gap-3 rounded-xl border bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <Mail className="size-5 text-slate-500" />
                  </div>
                  <p className="text-base font-medium">{item}</p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 text-base"
                  onClick={() => setEmails((prev) => prev.filter((emailItem) => emailItem !== item))}
                >
                  <Trash2 className="size-4" />
                  Kaldir
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
