import { Mail, Pencil, Power, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/server"

import {
  createLinkedEmailAction,
  createWarehouseAction,
  removeLinkedEmailAction,
  renameWarehouseAction,
  toggleWarehouseActiveAction,
} from "./actions"

type LinkedEmail = {
  id: string
  email: string
  is_active: boolean
}

type Warehouse = {
  id: string
  name: string
  is_active: boolean
}

export default async function AyarlarPage() {
  const supabase = await createClient()

  const [{ data: linkedEmailData, error: linkedEmailError }, { data: warehouseData, error: warehouseError }] =
    await Promise.all([
      supabase.from("linked_emails").select("id, email, is_active").order("created_at", { ascending: false }),
      supabase.from("warehouses").select("id, name, is_active").order("created_at", { ascending: false }),
    ])

  if (linkedEmailError) {
    throw new Error(`Bağlı e-posta listesi yüklenemedi: ${linkedEmailError.message}`)
  }

  if (warehouseError) {
    throw new Error(`Depo listesi yüklenemedi: ${warehouseError.message}`)
  }

  const linkedEmails = (linkedEmailData ?? []) as LinkedEmail[]
  const warehouses = (warehouseData ?? []) as Warehouse[]

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Ayarlar</h1>
        <p className="mt-2 text-base text-slate-600">Sipariş/teslimat e-postalarını ve depo yönetimini buradan kontrol et.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Mail Entegrasyon Altyapısı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={createLinkedEmailAction} className="space-y-3">
            <Label htmlFor="new-mail" className="text-base">
              Yeni E-posta Adresi Ekle
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="new-mail"
                type="email"
                name="email"
                required
                placeholder="ornek@firma.com"
                className="h-12 text-base"
              />
              <Button size="lg" className="h-12 text-base">
                <Plus className="size-4" />
                Mail Ekle
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {linkedEmails.length === 0 ? (
              <p className="rounded-lg border bg-slate-50 px-3 py-2 text-base text-slate-600">Henüz bağlı e-posta yok.</p>
            ) : (
              linkedEmails.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white p-2">
                      <Mail className="size-5 text-slate-500" />
                    </div>
                    <p className="text-base font-medium">{item.email}</p>
                  </div>
                  <form action={removeLinkedEmailAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button variant="outline" size="lg" className="h-11 text-base">
                      <Trash2 className="size-4" />
                      Kaldır
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Depo Yönetimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={createWarehouseAction} className="space-y-3">
            <Label htmlFor="warehouse-name" className="text-base">
              Yeni Depo Ekle
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="warehouse-name"
                type="text"
                name="name"
                required
                placeholder="Örn: Şube Deposu"
                className="h-12 text-base"
              />
              <Button size="lg" className="h-12 text-base">
                <Plus className="size-4" />
                Depo Ekle
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {warehouses.length === 0 ? (
              <p className="rounded-lg border bg-slate-50 px-3 py-2 text-base text-slate-600">Henüz depo yok.</p>
            ) : (
              warehouses.map((warehouse) => (
                <div key={warehouse.id} className="rounded-xl border bg-slate-50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">{warehouse.name}</p>
                      <p className="text-sm text-slate-600">{warehouse.is_active ? "Aktif depo" : "Pasif depo"}</p>
                    </div>
                    <form action={toggleWarehouseActiveAction}>
                      <input type="hidden" name="id" value={warehouse.id} />
                      <input type="hidden" name="is_active" value={warehouse.is_active ? "true" : "false"} />
                      <Button
                        variant={warehouse.is_active ? "outline" : "default"}
                        size="lg"
                        className="h-11 text-base"
                      >
                        <Power className="size-4" />
                        {warehouse.is_active ? "Pasifleştir" : "Aktifleştir"}
                      </Button>
                    </form>
                  </div>

                  <form action={renameWarehouseAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input type="hidden" name="id" value={warehouse.id} />
                    <Input
                      type="text"
                      name="name"
                      defaultValue={warehouse.name}
                      required
                      className="h-11 text-base"
                    />
                    <Button variant="secondary" size="lg" className="h-11 text-base">
                      <Pencil className="size-4" />
                      İsmi Güncelle
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
