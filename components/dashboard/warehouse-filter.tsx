"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type WarehouseFilterProps = {
  value: string
}

const options = [
  { value: "Dukkan", label: "Dukkan" },
  { value: "Ana Depo", label: "Ana Depo" },
  { value: "Arac", label: "Arac" },
]

export function WarehouseFilter({ value }: WarehouseFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onValueChange(nextValue: string | null) {
    if (!nextValue) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("depo", nextValue)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      <p className="text-base font-medium">Depo Filtresi</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-12 w-full text-base sm:w-60" size="default">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-base">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
