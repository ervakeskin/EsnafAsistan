import { AlertCircle, CheckCircle2, Info } from "lucide-react"

import { cn } from "@/lib/utils"

type StatusAlertVariant = "error" | "success" | "info"

type StatusAlertProps = {
  message: string
  variant?: StatusAlertVariant
  className?: string
}

const variantStyles: Record<StatusAlertVariant, string> = {
  error: "border-red-200 bg-danger-bg text-danger",
  success: "border-emerald-200 bg-success-bg text-success",
  info: "border-sky-200 bg-sky-50 text-sky-700",
}

const variantIcons: Record<StatusAlertVariant, typeof AlertCircle> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

export function StatusAlert({ message, variant = "info", className }: StatusAlertProps) {
  const Icon = variantIcons[variant]

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", variantStyles[variant], className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
