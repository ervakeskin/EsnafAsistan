"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { updateDeliveryStatusAction, deleteDeliveryAction } from "./actions"

type ActionResult = { success: boolean; message: string }

function useAction(action: (formData: FormData) => Promise<ActionResult>) {
  return useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  )
}

export function DeliveryStatusForm({ deliveryId, status, label }: { deliveryId: string; status: string; label: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useAction(updateDeliveryStatusAction)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [state, router])

  const isTeslim = status === "teslim-alindi"

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={deliveryId} />
      <input type="hidden" name="status" value={status} />
      <Button size="sm" className="h-11 min-h-11 sm:h-9 sm:min-h-9" variant={isTeslim ? "default" : "outline"} disabled={isPending}>
        {isPending ? "İşleniyor..." : label}
      </Button>
      {state?.message && !state.success && (
        <p className="mt-1 text-xs text-danger">{state.message}</p>
      )}
      {state?.message && state.success && (
        <p className="mt-1 text-xs text-success">✓ {state.message}</p>
      )}
    </form>
  )
}

export function DeleteDeliveryForm({ deliveryId }: { deliveryId: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useAction(deleteDeliveryAction)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={deliveryId} />
      <Button type="submit" size="icon-sm" variant="outline" className="h-11 w-11 min-h-11 sm:h-9 sm:w-9 sm:min-h-9" disabled={isPending}>
        Sil
      </Button>
      {state?.message && !state.success && (
        <p className="mt-1 text-xs text-danger">{state.message}</p>
      )}
    </form>
  )
}
