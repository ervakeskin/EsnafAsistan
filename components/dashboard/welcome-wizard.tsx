"use client"

import { useState } from "react"
import { Store, Box, Wallet, Truck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type WizardStep = {
  icon: typeof Store
  title: string
  description: string
}

const STEPS: WizardStep[] = [
  { icon: Store, title: "Dükkanını Tanı", description: "İlk olarak dükkanının adını ve temel ayarlarını yapalım." },
  { icon: Box, title: "Ürün Ekle", description: "Depona ilk ürünlerini ekle. Fotoğraf çekerek veya barkod okutarak hızlıca ekleyebilirsin." },
  { icon: Wallet, title: "Kasa Başlangıcı", description: "Günlük kasana başlangıç bakiyesi ekle ve gelir/gider takibine başla." },
  { icon: Truck, title: "Tedarikçiler", description: "Sık çalıştığın tedarikçileri ekle, sonraki siparişlerde hızla seç." },
  { icon: Check, title: "Hazırsın!", description: "Tüm ayarların tamamlandı. Artık dükkanını yönetmeye başlayabilirsin." },
]

type WelcomeWizardProps = {
  onComplete: () => void
}

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const [step, setStep] = useState(0)
  const [shopName, setShopName] = useState("")

  async function handleNext() {
    if (step === 0 && shopName.trim()) {
      await fetch("/api/settings/shop-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName: shopName.trim() }),
      })
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const currentStep = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl ring-1 ring-foreground/10">
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full mx-1 transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <currentStep.icon className="size-8" />
          </div>
          <h2 className="text-2xl font-bold">{currentStep.title}</h2>
          <p className="mt-2 text-base text-muted-foreground">{currentStep.description}</p>
        </div>

        {step === 0 && (
          <div className="space-y-3 mb-6">
            <Label htmlFor="wizard-shop-name" className="text-base">Dükkan Adı</Label>
            <Input
              id="wizard-shop-name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Örn: Yılmaz Hırdavat"
              className="h-12 text-[18px]"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" size="lg" className="h-12 flex-1 text-base" onClick={() => setStep(step - 1)}>
              Geri
            </Button>
          )}
          <Button
            size="lg"
            className="h-12 flex-1 text-base"
            onClick={handleNext}
            disabled={step === 0 && !shopName.trim()}
          >
            {step === STEPS.length - 1 ? "Başla!" : "Devam"}
          </Button>
        </div>
      </div>
    </div>
  )
}
