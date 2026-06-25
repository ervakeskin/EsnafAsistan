"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="lg"
      className="h-11 gap-2 text-base -ml-2"
      onClick={() => router.back()}
    >
      <ChevronLeft className="size-4" />
      Geri
    </Button>
  )
}
