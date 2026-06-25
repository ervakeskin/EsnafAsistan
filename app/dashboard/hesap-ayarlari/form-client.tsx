"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LogOut, Trash2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusAlert } from "@/components/ui/status-alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ChangePasswordForm() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "Bir hata oluştu." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password" className="text-base">Mevcut Şifre</Label>
        <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="h-12 text-[18px]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-base">Yeni Şifre</Label>
        <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="h-12 text-[18px]" placeholder="En az 8 karakter, büyük/küçük harf + rakam" />
      </div>
      {message && <StatusAlert message={message.text} variant={message.type} />}
      <Button type="submit" size="lg" className="h-12 text-base" disabled={loading}>
        {loading ? <><Loader2 className="size-4 animate-spin" /> Değiştiriliyor...</> : <><KeyRound className="size-5" /> Şifreyi Değiştir</>}
      </Button>
    </form>
  )
}

export function LogoutAllButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleLogoutAll() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/logout-all", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        router.replace("/")
        router.refresh()
      } else {
        setMessage(data.message)
      }
    } catch {
      setMessage("Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">Tüm cihazlardaki oturumlarını sonlandır ve güvenliği artır.</p>
      <Button variant="outline" size="lg" className="h-12 text-base" onClick={handleLogoutAll} disabled={loading}>
        {loading ? <><Loader2 className="size-4 animate-spin" /> Çıkış yapılıyor...</> : <><LogOut className="size-5" /> Tüm Cihazlardan Çıkış Yap</>}
      </Button>
      {message && <StatusAlert message={message} variant="error" />}
    </div>
  )
}

export function DeleteAccountForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function handleDelete() {
    if (confirmText !== "SİL") return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/delete-account", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        router.replace("/")
        router.refresh()
      } else {
        setMessage(data.message)
      }
    } catch {
      setMessage("Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-foreground">
        Hesabını silersen tüm dükkan verilerin (stok, kasa, teslimat, hatırlatıcılar) silinir. Bu işlem geri alınamaz.
      </p>
      <Dialog>
        <DialogTrigger render={<Button variant="destructive" size="lg" className="h-12 text-base"><Trash2 className="size-5" /> Hesabı Sil</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">Hesabı Sil</DialogTitle>
            <DialogDescription className="text-base">
              Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinecek.
              Onaylamak için aşağıya <strong>SİL</strong> yaz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="SİL" className="h-12 text-[18px] text-center font-bold" />
            <Button variant="destructive" size="lg" className="h-12 w-full text-base" disabled={confirmText !== "SİL" || loading} onClick={handleDelete}>
              {loading ? <><Loader2 className="size-4 animate-spin" /> Siliniyor...</> : "Hesabı Kalıcı Olarak Sil"}
            </Button>
            {message && <StatusAlert message={message} variant="error" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
