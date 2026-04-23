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
}

export function AddProductDialog({ action }: AddProductDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="h-12 w-full text-base sm:w-auto" />
        }
      >
        <PlusCircle className="size-5" />
        Yeni Urun Ekle
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Yeni Urun Kaydi</DialogTitle>
          <DialogDescription className="text-base">
            Urunu depoya eklemek icin bilgileri doldur.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Urun Adi
            </Label>
            <Input
              id="name"
              name="name"
              required
              className="h-12 text-base"
              placeholder="Orn: 1/2 Kure Vana"
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
                Alis Fiyati (TL)
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
              <Label htmlFor="warehouse" className="text-base">
                Depo Konumu
              </Label>
              <Select name="warehouse" defaultValue="Ana Depo">
                <SelectTrigger id="warehouse" className="h-12 w-full text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dukkan" className="text-base">
                    Dukkan
                  </SelectItem>
                  <SelectItem value="Ana Depo" className="text-base">
                    Ana Depo
                  </SelectItem>
                  <SelectItem value="Arac" className="text-base">
                    Arac
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button size="lg" className="h-12 w-full text-base">
            Urunu Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
