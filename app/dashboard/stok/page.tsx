import { AddProductDialog } from "@/components/dashboard/add-product-dialog"
import { SaleProductDialog } from "@/components/dashboard/sale-product-dialog"
import { WarehouseFilter } from "@/components/dashboard/warehouse-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

import { createProductAction, createSaleAction, deleteProductAction } from "./actions"

type StokPageProps = {
  searchParams?: Promise<{ depo?: string }>
}

type Product = {
  id: string
  name: string
  quantity: number
  unit: string
  purchase_price: number
  warehouse: string
}

const warehouseOptions = ["Dukkan", "Ana Depo", "Arac"] as const

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function StokPage({ searchParams }: StokPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedWarehouse = warehouseOptions.includes(
    resolvedSearchParams.depo as (typeof warehouseOptions)[number],
  )
    ? (resolvedSearchParams.depo as (typeof warehouseOptions)[number])
    : "Ana Depo"

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, quantity, unit, purchase_price, warehouse")
    .eq("warehouse", selectedWarehouse)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Stok listesi yuklenemedi: ${error.message}`)
  }

  const products = (data ?? []) as Product[]

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Mallar & Depolar</h1>
        <p className="text-base text-slate-600">
          Alis fiyatlarini net gor, depoya gore filtrele ve urunleri tek yerden yonet.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Stok Listesi</CardTitle>
            <p className="text-base text-muted-foreground">
              Aktif filtre: <span className="font-semibold">{selectedWarehouse}</span>
            </p>
          </div>
          <AddProductDialog action={createProductAction} />
        </CardHeader>
        <CardContent className="space-y-5">
          <WarehouseFilter value={selectedWarehouse} />

          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Urun</TableHead>
                <TableHead className="text-base">Miktar</TableHead>
                <TableHead className="text-base">Birim</TableHead>
                <TableHead className="text-base">Depo Konumu</TableHead>
                <TableHead className="text-base">Alis Fiyati</TableHead>
                <TableHead className="text-right text-base">Islem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-base text-slate-500">
                    Bu depoda henuz urun yok.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="text-base font-semibold">{product.name}</TableCell>
                    <TableCell className="text-base">{product.quantity}</TableCell>
                    <TableCell className="text-base">{product.unit}</TableCell>
                    <TableCell className="text-base">{product.warehouse}</TableCell>
                    <TableCell className="text-base font-semibold text-slate-900">
                      {formatPrice(Number(product.purchase_price))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <SaleProductDialog
                          product={{
                            id: product.id,
                            name: product.name,
                            quantity: product.quantity,
                            unit: product.unit,
                            purchasePrice: Number(product.purchase_price),
                          }}
                          action={createSaleAction}
                        />
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <Button
                            type="submit"
                            variant="destructive"
                            size="lg"
                            className="h-11 text-base"
                          >
                            Sil
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
