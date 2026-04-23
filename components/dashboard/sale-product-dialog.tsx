"use client"

import { DollarSign } from "lucide-react"

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

type SaleProductDialogProps = {
  product: {
    id: string
    name: string
    quantity: number
    unit: string
    purchasePrice: number
  }
  action: (formData: FormData) => Promise<void>
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

export function SaleProductDialog({ product, action }: SaleProductDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" size="lg" className="h-11 text-base">
            <DollarSign className="size-5" />
            Satış Yap
          </Button>
        }
      />

      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">{product.name} Satışı</DialogTitle>
          <DialogDescription className="text-base">
            Alış fiyatı sadece bilgi için görünür. Satış fiyatını şu anki duruma göre manuel gir.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 px-6 pb-6">
          <input type="hidden" name="product_id" value={product.id} />

          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Alış Fiyatı (Bilgi)</p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatPrice(product.purchasePrice)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Stokta {product.quantity} {product.unit}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`sale_price-${product.id}`} className="text-base">
                Satış Fiyatı (TL)
              </Label>
              <Input
                id={`sale_price-${product.id}`}
                name="sale_price"
                type="number"
                min={0.01}
                step="0.01"
                required
                autoFocus
                className="h-12 text-base"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`quantity-${product.id}`} className="text-base">
                Satış Miktarı
              </Label>
              <Input
                id={`quantity-${product.id}`}
                name="quantity"
                type="number"
                min={1}
                max={product.quantity}
                required
                className="h-12 text-base"
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`customer_name-${product.id}`} className="text-base">
              Müşteri Adı / Firma
            </Label>
            <Input
              id={`customer_name-${product.id}`}
              name="customer_name"
              className="h-12 text-base"
              placeholder="Örn: Yılmaz İnşaat"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`note-${product.id}`} className="text-base">
              Not
            </Label>
            <Input
              id={`note-${product.id}`}
              name="note"
              className="h-12 text-base"
              placeholder="Örn: Peşin ödendi"
            />
          </div>

          <Button size="lg" className="h-12 w-full text-base">
            Satışı Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
