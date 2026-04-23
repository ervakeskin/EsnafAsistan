"use client"

import { PlusCircle } from "lucide-react"

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

type AddProductDialogProps = {
  action: (formData: FormData) => Promise<void>
  warehouses: Array<{ id: string; name: string }>
  defaultWarehouseId: string | null
}

export function AddProductDialog({ action, warehouses, defaultWarehouseId }: AddProductDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="h-12 w-full text-base sm:w-auto" />
        }
      >
        <PlusCircle className="size-5" />
        Yeni Ürün Ekle
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Yeni Ürün Kaydı</DialogTitle>
          <DialogDescription className="text-base">
            Ürünü depoya eklemek için bilgileri doldur.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Ürün Adı
            </Label>
            <Input
              id="name"
              name="name"
              required
              className="h-12 text-base"
              placeholder="Örn: 1/2 Küre Vana"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-base">
                Miktar
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                required
                className="h-12 text-base"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-base">
                Birim
              </Label>
              <Input
                id="unit"
                name="unit"
                required
                className="h-12 text-base"
                placeholder="Adet / Kutu / Metre"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-base">
                Alış Fiyatı (TL)
              </Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                min={0}
                step="0.01"
                required
                className="h-12 text-base"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse_id" className="text-base">
                Depo Konumu
              </Label>
              <Select name="warehouse_id" defaultValue={defaultWarehouseId ?? undefined}>
                <SelectTrigger id="warehouse_id" className="h-12 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id} className="text-base">
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {warehouses.length === 0 ? (
                <p className="text-sm text-red-600">Önce Ayarlar sayfasından aktif depo ekleyin.</p>
              ) : null}
            </div>
          </div>

          <Button size="lg" className="h-12 w-full text-base" disabled={warehouses.length === 0}>
            Ürünü Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
