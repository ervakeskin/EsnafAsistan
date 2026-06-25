"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Minus, ShoppingCart, Trash2, Banknote, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusAlert } from "@/components/ui/status-alert"

type PosProduct = {
  id: string
  name: string
  quantity: number
  unit: string
  purchasePrice: number
}

type CartItem = {
  product: PosProduct
  quantity: number
  salePrice: number
}

type PosClientProps = {
  products: PosProduct[]
}

export function PosClient({ products }: PosClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentType, setPaymentType] = useState<"nakit" | "kart">("nakit")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
            : item
        )
      }
      return [...prev, { product, quantity: 1, salePrice: product.purchasePrice * 1.2 }]
    })
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function updatePrice(productId: string, price: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, salePrice: price } : item
      )
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0)

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setMessage(null)
    try {
      for (const item of cart) {
        const formData = new FormData()
        formData.append("product_id", item.product.id)
        formData.append("quantity", String(item.quantity))
        formData.append("sale_price", String(item.salePrice))
        formData.append("payment_type", paymentType)
        formData.append("customer_name", "POS Satış")

        await fetch("/api/products/sale", {
          method: "POST",
          body: formData,
        })
      }
      setCart([])
      setMessage(`Satış başarılı! Toplam: ${total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`)
      setTimeout(() => router.refresh(), 1000)
    } catch {
      setMessage("Satış sırasında bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ürün ara..."
        className="h-12 text-[18px]"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => addToCart(product)}
            className="flex flex-col items-center justify-center rounded-xl border bg-card p-3 text-center hover:border-primary hover:bg-primary/5 transition-colors min-h-[80px]"
          >
            <span className="text-sm font-semibold leading-tight">{product.name}</span>
            <span className="text-xs text-muted-foreground mt-1">{product.quantity} {product.unit}</span>
          </button>
        ))}
        {filteredProducts.length === 0 && (
          <p className="col-span-full py-4 text-center text-base text-muted-foreground">Stokta ürün bulunamadı.</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold">Sepet</h3>
          {cart.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" onClick={() => updateQuantity(item.product.id, -1)} className="touch-target rounded-md border p-1"><Minus className="size-4" /></button>
                  <span className="text-base font-bold w-8 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.product.id, 1)} className="touch-target rounded-md border p-1"><Plus className="size-4" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={item.salePrice}
                  onChange={(e) => updatePrice(item.product.id, Number(e.target.value))}
                  className="h-10 w-24 text-base text-right"
                  step="0.01"
                  min="0.01"
                />
                <button type="button" onClick={() => removeFromCart(item.product.id)} className="touch-target text-destructive">
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("nakit")}
                className={`h-12 rounded-lg border px-4 text-base flex items-center gap-2 ${paymentType === "nakit" ? "border-primary bg-primary/10" : ""}`}
              >
                <Banknote className="size-5" /> Nakit
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("kart")}
                className={`h-12 rounded-lg border px-4 text-base flex items-center gap-2 ${paymentType === "kart" ? "border-primary bg-primary/10" : ""}`}
              >
                <CreditCard className="size-5" /> Kart
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Toplam</p>
              <p className="text-2xl font-bold">{total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</p>
            </div>
          </div>

          <Button size="lg" className="h-14 w-full text-lg" disabled={loading} onClick={handleCheckout}>
            {loading ? <><Loader2 className="size-5 animate-spin" /> Ödeme alınıyor...</> : <><ShoppingCart className="size-5" /> Ödemeyi Tamamla ({total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })})</>}
          </Button>

          {message && <StatusAlert message={message} variant="success" />}
        </div>
      )}
    </div>
  )
}
