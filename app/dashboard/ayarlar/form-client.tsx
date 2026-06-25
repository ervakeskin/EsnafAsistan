"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Loader2, Mail, Pencil, Plus, Power, Store, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ActionResult } from "./actions"
import {
  createWarehouseAction,
  deleteWarehouseAction,
  removeKnownSenderAction,
  renameWarehouseAction,
  saveShopNameAction,
  toggleWarehouseActiveAction,
} from "./actions"

type KnownSender = { id: string; email: string; can_read?: boolean; created_at?: string }
type Warehouse = { id: string; name: string; is_active: boolean; location_type?: string }

function useForm(action: (formData: FormData) => Promise<ActionResult>) {
  return useActionState(async (_prev: ActionResult | null, formData: FormData) => action(formData), null)
}

function FormFeedback({ state, isPending }: { state: ActionResult | null; isPending: boolean }) {
  if (isPending) {
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-blue-600">
        <Loader2 className="size-4 animate-spin" />
        İşleniyor...
      </p>
    )
  }
  if (!state) return null
  return (
    <p className={`mt-3 rounded-md px-3 py-2 text-sm ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
      {state.message}
    </p>
  )
}

export function ShopNameForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useForm(saveShopNameAction)

  useEffect(() => {
    if (state?.success) router.refresh()
  }, [state, router])

  return (
    <form action={formAction} className="space-y-3">
      <Label htmlFor="shop-name" className="text-base">Dükkan Adı</Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input id="shop-name" type="text" name="shop_name" required defaultValue={defaultValue} placeholder="Örn: Mehmet Ticaret" className="h-12 text-base" />
        <Button size="lg" className="h-12 text-base" disabled={isPending}>
          <Store className="size-4" />
          Kaydet
        </Button>
      </div>
      <FormFeedback state={state} isPending={isPending} />
    </form>
  )
}

export function EmailForwardingSection({ forwardingAddress }: { forwardingAddress?: string | null }) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCopy = async () => {
    if (!forwardingAddress) return
    try {
      await navigator.clipboard.writeText(forwardingAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      inputRef.current?.select()
    }
  }

  return (
    <div className="space-y-4">
      {forwardingAddress ? (
        <>
          <p className="text-base text-slate-700 leading-relaxed">
            Toptancılarının sana gönderdiği sipariş/fatura e-postalarını aşağıdaki adrese
            <strong> yönlendir</strong> (forward et). Sistem gelen mailleri otomatik tanır.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                readOnly
                value={forwardingAddress}
                className="h-12 pr-10 text-base font-mono text-slate-800 bg-white"
              />
            </div>
            <Button onClick={handleCopy} size="lg" variant="outline" className="h-12 text-base gap-2">
              <Copy className="size-4" />
              {copied ? "Kopyalandı!" : "Adresi Kopyala"}
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            💡 Örnek: Toptancın sana e-posta gönderdiğinde, o maili olduğu gibi bu adrese yönlendir.
            Yeni bir e-posta yazmana gerek yok.
          </p>
        </>
      ) : (
        <>
          <p className="text-base text-slate-600">
            Yönlendirme adresi oluşturmak için önce dükkan adını kaydet.
          </p>
        </>
      )}
    </div>
  )
}

export function KnownSendersSection({ senders }: { senders: KnownSender[] }) {
  const router = useRouter()
  const [removeState, removeAction, removePending] = useForm(removeKnownSenderAction)

  useEffect(() => {
    if (removeState?.success) router.refresh()
  }, [removeState, router])

  return (
    <div className="space-y-4">
      {senders.length === 0 ? (
        <p className="rounded-lg border bg-slate-50 px-3 py-2 text-base text-slate-600">
          Henüz hiçbir toptancıdan mail yönlendirilmedi. Bir mail yönlendirdiğinde burada görünecek.
        </p>
      ) : (
        <div className="space-y-2">
          {senders.map((item) => (
            <div key={item.id} className="rounded-xl border bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white p-2">
                    <Mail className="size-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-base font-medium">{item.email}</p>
                  </div>
                </div>
                <form action={removeAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button variant="destructive" size="lg" className="h-11 text-base" disabled={removePending}>
                    <Trash2 className="size-4" />
                    Kaldır
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function WarehouseSection({ warehouses }: { warehouses: Warehouse[] }) {
  const router = useRouter()
  const [addState, addAction, addPending] = useForm(createWarehouseAction)
  const [toggleState, toggleAction, togglePending] = useForm(toggleWarehouseActiveAction)
  const [renameState, renameAction, renamePending] = useForm(renameWarehouseAction)
  const [deleteWState, deleteWAction, deleteWPending] = useForm(deleteWarehouseAction)

  useEffect(() => {
    if (addState?.success || toggleState?.success || renameState?.success || deleteWState?.success) router.refresh()
  }, [addState, toggleState, renameState, deleteWState, router])

  return (
    <div className="space-y-5">
      <form action={addAction} className="space-y-3">
        <Label htmlFor="warehouse-name" className="text-base">Yeni Lokasyon Ekle</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input id="warehouse-name" type="text" name="name" required placeholder="Örn: Şube Deposu / Raf-1" className="h-12 text-base" />
          <select name="location_type" required className="h-12 rounded-lg border border-input bg-transparent px-3 text-base">
            <option value="depo">Depo</option>
            <option value="raf">Raf</option>
          </select>
          <Button size="lg" className="h-12 text-base" disabled={addPending}>
            <Plus className="size-4" />
            Ekle
          </Button>
        </div>
      </form>

      <FormFeedback state={addState} isPending={addPending} />

      <div className="space-y-3">
        {warehouses.length === 0 ? (
          <p className="rounded-lg border bg-slate-50 px-3 py-2 text-base text-slate-600">Henüz lokasyon yok.</p>
        ) : (
          warehouses.map((warehouse) => {
            const isRaf = warehouse.location_type === "raf"
            return (
              <div key={warehouse.id} className="rounded-xl border bg-slate-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold">{warehouse.name}</p>
                    <p className="text-sm text-slate-600">{isRaf ? "🏪 Raf" : "🏭 Depo"} — {warehouse.is_active ? "Aktif" : "Pasif"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleAction}>
                      <input type="hidden" name="id" value={warehouse.id} />
                      <input type="hidden" name="is_active" value={warehouse.is_active ? "true" : "false"} />
                      <Button variant={warehouse.is_active ? "outline" : "default"} size="lg" className="h-11 text-base" disabled={togglePending}>
                        <Power className="size-4" />
                        {warehouse.is_active ? "Pasifleştir" : "Aktifleştir"}
                      </Button>
                    </form>
                    <form action={deleteWAction}>
                      <input type="hidden" name="id" value={warehouse.id} />
                      <Button variant="destructive" size="lg" className="h-11 text-base" disabled={deleteWPending}>
                        <Trash2 className="size-4" />
                        Sil
                      </Button>
                    </form>
                  </div>
                </div>
                <form action={renameAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input type="hidden" name="id" value={warehouse.id} />
                  <Input type="text" name="name" defaultValue={warehouse.name} required className="h-11 text-base" />
                  <Button variant="secondary" size="lg" className="h-11 text-base" disabled={renamePending}>
                    <Pencil className="size-4" />
                    İsmi Güncelle
                  </Button>
                </form>
                <FormFeedback state={toggleState} isPending={togglePending} />
                <FormFeedback state={renameState} isPending={renamePending} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
