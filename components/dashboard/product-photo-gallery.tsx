"use client"

import { useState } from "react"
import { Camera, Trash2, ImageUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ProductPhoto = {
  id: string
  photo_url: string
  is_primary: boolean
}

type ProductPhotoGalleryProps = {
  photos: ProductPhoto[]
  productId: string
  onUpload: (productId: string, file: File) => Promise<void>
  onDelete: (photoId: string) => Promise<void>
  onSetPrimary: (photoId: string) => Promise<void>
}

export function ProductPhotoGallery({ photos, productId, onUpload, onDelete, onSetPrimary }: ProductPhotoGalleryProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(productId, file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative size-20 overflow-hidden rounded-lg border">
            <button type="button" onClick={() => setPreviewUrl(photo.photo_url)} className="size-full">
              <img src={photo.photo_url} alt="Ürün fotoğrafı" className="size-full object-cover" />
            </button>
            {photo.is_primary && (
              <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-1 rounded-br">
                Ana
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              {!photo.is_primary && (
                <button type="button" onClick={() => onSetPrimary(photo.id)} className="text-white hover:text-primary text-xs">
                  Ana Yap
                </button>
              )}
              <button type="button" onClick={() => onDelete(photo.id)} className="text-danger hover:text-danger">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
          {uploading ? (
            <span className="animate-pulse text-xs">Yükleniyor...</span>
          ) : (
            <ImageUp className="size-6" />
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ürün Fotoğrafı</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center">
              <img src={previewUrl} alt="Ürün fotoğrafı" className="max-h-[60vh] rounded-lg object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
