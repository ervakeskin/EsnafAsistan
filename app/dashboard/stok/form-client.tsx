"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteProductAction } from "./actions"

type ActionResult = { success: boolean; message: string }

function useAction(action: (formData: FormData) => Promise<ActionResult>) {
  return useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  )
}

export function DeleteProductForm({ productId }: { productId: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useAction(deleteProductAction)

  useEffect(() => {
    if (state?.success) {
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={productId} />
      <Button type="submit" variant="destructive" size="lg" className="h-11 text-base" disabled={isPending}>
        {isPending ? "Siliniyor..." : "Sil"}
      </Button>
      {state?.message && !state.success && (
        <p className="mt-1 text-sm text-danger">{state.message}</p>
      )}
    </form>
  )
}
