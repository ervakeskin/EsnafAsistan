"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ActionResult } from "@/app/dashboard/teslimatlar/actions"

type AddDeliveryDialogProps = {
  action: (formData: FormData) => Promise<ActionResult>
  products: Array<{ id: string; name: string }>
}

export function AddDeliveryDialog({ action, products }: AddDeliveryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  )

  useEffect(() => {
    if (state?.success) {
      setOpen(false)
      router.refresh()
    }
  }, [state, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="h-12 w-full text-base sm:w-auto" />}>
        <PlusCircle className="size-5" />
        Yeni Teslimat Ekle
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Yeni Teslimat Kaydı</DialogTitle>
          <DialogDescription className="text-base">
            Tedarikçiden beklenen malı takvime ekle.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="supplier_name" className="text-base">Tedarikçi</Label>
            <Input id="supplier_name" name="supplier_name" required className="h-12 text-base" placeholder="Örn: Yılmaz Hırdavat" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_id" className="text-base">Ürün (opsiyonel)</Label>
            <Select name="product_id">
              <SelectTrigger id="product_id" className="h-12 w-full text-base">
                <SelectValue placeholder="Genel sipariş" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id} className="text-base">
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expected_date" className="text-base">Beklenen Tarih</Label>
              <Input id="expected_date" name="expected_date" type="date" required className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base">Miktar</Label>
              <Input id="quantity" name="quantity" type="number" min={1} required className="h-12 text-base" placeholder="0" />
            </div>
          </div>

          <Button size="lg" className="h-12 w-full text-base" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="size-4 animate-spin" /> Kaydediliyor...</>
            ) : "Teslimatı Kaydet"}
          </Button>

          {state?.message && !state.success && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
