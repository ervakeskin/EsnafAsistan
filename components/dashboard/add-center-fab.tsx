"use client"

import { FormEvent, useMemo, useState } from "react"
import { Camera, LoaderCircle, Plus, ScanText, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
import { StatusAlert } from "@/components/ui/status-alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type WarehouseOption = {
  id: string
  name: string
}

type OcrRow = {
  id: string
  name: string
  quantity: number
  unit: string
  purchasePrice: number
}

type AddCenterFabProps = {
  warehouses: WarehouseOption[]
}

function parseOcrTextToRows(rawText: string) {
  const rows = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const parsed = rows
    .map((line, index) => {
      const matched = line.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)$/)
      if (!matched) return null

      return {
        id: `ocr-${index}-${Date.now()}`,
        name: matched[1].trim(),
        quantity: Number(matched[2].replace(",", ".")),
        unit: "Adet",
        purchasePrice: 1,
      } satisfies OcrRow
    })
    .filter((row): row is OcrRow => Boolean(row))

  return parsed
}

export function AddCenterFab({ warehouses }: AddCenterFabProps) {
  const router = useRouter()
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)
  const [isReadingOcr, setIsReadingOcr] = useState(false)
  const [isSubmittingOcr, setIsSubmittingOcr] = useState(false)
  const [manualMessage, setManualMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [ocrMessage, setOcrMessage] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null)
  const [ocrRows, setOcrRows] = useState<OcrRow[]>([])
  const [ocrWarehouseId, setOcrWarehouseId] = useState("")

  const defaultWarehouseId = useMemo(() => warehouses[0]?.id ?? "", [warehouses])

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setManualMessage(null)
    setIsSubmittingManual(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await fetch("/api/products/manual", {
        method: "POST",
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      const message = payload?.message ?? "Beklenmeyen bir hata oluştu."

      if (!response.ok) {
        setManualMessage({ type: "error", text: message })
        return
      }

      setManualMessage({ type: "success", text: message })
      event.currentTarget.reset()
      router.refresh()
    } catch (error) {
      setManualMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Mal eklenemedi: ${error.message}`
            : "Mal eklenemedi. Lütfen tekrar dene.",
      })
    } finally {
      setIsSubmittingManual(false)
    }
  }

  async function handleReadOcr(file: File | null) {
    if (!file) {
      setOcrMessage({ type: "error", text: "Önce bir fotoğraf seçmelisin." })
      return
    }

    setOcrMessage({ type: "info", text: "Fotoğraf okunuyor, lütfen bekle..." })
    setIsReadingOcr(true)

    try {
      const tesseract = await import("tesseract.js")
      const result = await tesseract.recognize(file, "tur+eng")
      const parsedRows = parseOcrTextToRows(result.data.text ?? "")

      if (parsedRows.length === 0) {
        setOcrRows([])
        setOcrMessage({
          type: "error",
          text: "Fotoğrafta ürün ve miktar satırı bulunamadı. Örn: Vana 12",
        })
        return
      }

      setOcrRows(parsedRows)
      setOcrMessage({ type: "success", text: `${parsedRows.length} satır okundu. Onaylayıp stoğa ekleyebilirsin.` })
    } catch (error) {
      setOcrRows([])
      setOcrMessage({
        type: "error",
        text:
          error instanceof Error
            ? `OCR başarısız: ${error.message}`
            : "Fotoğraf okunamadı. Daha net bir görsel deneyin.",
      })
    } finally {
      setIsReadingOcr(false)
    }
  }

  async function handleOcrImport() {
    setOcrMessage(null)
    setIsSubmittingOcr(true)

    try {
      const response = await fetch("/api/products/ocr-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId: ocrWarehouseId || defaultWarehouseId,
          items: ocrRows,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      const message = payload?.message ?? "Beklenmeyen bir hata oluştu."

      if (!response.ok) {
        setOcrMessage({ type: "error", text: message })
        return
      }

      setOcrMessage({ type: "success", text: message })
      setOcrRows([])
      router.refresh()
    } catch (error) {
      setOcrMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Toplu ekleme başarısız: ${error.message}`
            : "Toplu ekleme başarısız oldu.",
      })
    } finally {
      setIsSubmittingOcr(false)
    }
  }

  function updateOcrRow(rowId: string, key: keyof OcrRow, value: string) {
    setOcrRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        if (key === "quantity" || key === "purchasePrice") {
          return { ...row, [key]: Number(value) || 0 }
        }
        return { ...row, [key]: value }
      }),
    )
  }

  function removeOcrRow(rowId: string) {
    setOcrRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  function clearOcrRows() {
    setOcrRows([])
    setOcrMessage({ type: "info", text: "OCR listesi temizlendi." })
  }

  function applyDefaultsToRows() {
    if (ocrRows.length === 0) {
      setOcrMessage({ type: "error", text: "Varsayılan atamak için önce okunmuş satır olmalı." })
      return
    }

    setOcrRows((prev) =>
      prev.map((row) => ({
        ...row,
        unit: row.unit.trim() ? row.unit : "Adet",
        purchasePrice: row.purchasePrice > 0 ? row.purchasePrice : 0,
      })),
    )
    setOcrMessage({ type: "success", text: "Boş alanlara varsayılan değerler atandı." })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="icon-lg" className="fixed right-6 bottom-6 z-40 size-14 rounded-full shadow-lg" aria-label="Ekleme merkezi aç" />
        }
      >
        <Plus className="size-6" />
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Ekleme Merkezi</DialogTitle>
          <DialogDescription className="text-base">
            Mal eklemek için elle giriş yap veya sipariş listesini fotoğraftan okut.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="px-6 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="manual">
              <Camera className="size-4" />
              Elle Mal Ekle
            </TabsTrigger>
            <TabsTrigger value="ocr">
              <ScanText className="size-4" />
              Fotoğraftan Liste Oku
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4 space-y-4">
            <form className="space-y-4" onSubmit={handleManualSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-name">Mal Adı</Label>
                  <Input id="manual-name" name="name" required placeholder="Örn: 1/2 Küresel Vana" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-warehouse">Depo</Label>
                  <select
                    id="manual-warehouse"
                    name="warehouse_id"
                    required
                    defaultValue={defaultWarehouseId}
                    className="h-12 w-full rounded-lg border border-input bg-transparent px-3 text-base"
                  >
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="manual-quantity">Stok Miktarı</Label>
                  <Input id="manual-quantity" name="quantity" type="number" min={0} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-unit">Birim</Label>
                  <Input id="manual-unit" name="unit" required defaultValue="Adet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-price">Birim Fiyat (TL)</Label>
                  <Input id="manual-price" name="purchase_price" type="number" step="0.01" min={0.01} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-photo">Fotoğraf Yükleme</Label>
                <Input id="manual-photo" name="photo" type="file" accept="image/*" />
              </div>

              {manualMessage ? <StatusAlert message={manualMessage.text} variant={manualMessage.type} /> : null}

              <Button type="submit" className="h-12 w-full text-base" disabled={isSubmittingManual || warehouses.length === 0}>
                {isSubmittingManual ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Kaydediliyor
                  </>
                ) : (
                  "Malı Kaydet"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="ocr" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ocr-file">Sipariş Listesi Fotoğrafı</Label>
              <Input
                id="ocr-file"
                type="file"
                accept="image/*"
                onChange={(event) => handleReadOcr(event.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocr-warehouse">Eklenecek Depo</Label>
              <select
                id="ocr-warehouse"
                value={ocrWarehouseId || defaultWarehouseId}
                onChange={(event) => setOcrWarehouseId(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-transparent px-3 text-base"
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            {ocrMessage ? (
              <StatusAlert
                message={ocrMessage.text}
                variant={ocrMessage.type === "success" ? "success" : ocrMessage.type === "error" ? "error" : "info"}
              />
            ) : null}

            {ocrRows.length > 0 ? (
              <div className="space-y-3 rounded-lg border bg-white p-3">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" className="h-10 text-sm" onClick={applyDefaultsToRows}>
                    Tümüne Varsayılan Değer Ata
                  </Button>
                  <Button type="button" variant="destructive" className="h-10 text-sm" onClick={clearOcrRows}>
                    Hepsini Temizle
                  </Button>
                </div>
                {ocrRows.map((row) => (
                  <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_120px_120px_140px_42px]">
                    <Input value={row.name} onChange={(event) => updateOcrRow(row.id, "name", event.target.value)} />
                    <Input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(event) => updateOcrRow(row.id, "quantity", event.target.value)}
                    />
                    <Input value={row.unit} onChange={(event) => updateOcrRow(row.id, "unit", event.target.value)} />
                    <Input
                      type="number"
                      min={0.01}
                      step="0.01"
                      value={row.purchasePrice}
                      onChange={(event) => updateOcrRow(row.id, "purchasePrice", event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      aria-label="Satırı sil"
                      onClick={() => removeOcrRow(row.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}

            <Button
              type="button"
              className="h-12 w-full text-base"
              disabled={isReadingOcr || isSubmittingOcr || ocrRows.length === 0 || warehouses.length === 0}
              onClick={handleOcrImport}
            >
              {isReadingOcr || isSubmittingOcr ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  İşleniyor
                </>
              ) : (
                "Onayla ve Stoğa Ekle"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
