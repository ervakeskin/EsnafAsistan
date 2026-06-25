"use client"

import { useState, useRef } from "react"
import { Barcode, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isValidBarcode } from "@/lib/barcode"

type BarcodeScannerProps = {
  onBarcodeDetected: (code: string) => void
}

export function BarcodeScanner({ onBarcodeDetected }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function startCamera() {
    setError("")
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError("Kamera erişim izni alınamadı. Lütfen manuel giriş yapın.")
      setScanning(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) {
      setError("Lütfen bir barkod girin.")
      return
    }
    if (!isValidBarcode(code)) {
      setError("Geçersiz barkod formatı. 8-14 haneli bir kod girin.")
      return
    }
    setError("")
    onBarcodeDetected(code)
    setManualCode("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="lg" className="h-12 text-base" onClick={scanning ? stopCamera : startCamera}>
          {scanning ? (
            <><Loader2 className="size-5 animate-spin" /> Kamerayı Kapat</>
          ) : (
            <><Camera className="size-5" /> Barkod Tara</>
          )}
        </Button>
      </div>

      {scanning && (
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
          <p className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
            Barkodu kameraya gösterin...
          </p>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="barcode-input" className="text-base">Barkod Numarası</Label>
          <Input
            id="barcode-input"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="8-14 haneli barkodu girin"
            className="h-12 text-[18px]"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 text-base">
          <Barcode className="size-5" /> Sorgula
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
