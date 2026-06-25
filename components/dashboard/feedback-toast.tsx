"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"
import { speakText } from "@/lib/tts"

type FeedbackToastProps = {
  message: string
  type: "success" | "error"
  onClose: () => void
  tts?: boolean
}

export function FeedbackToast({ message, type, onClose, tts = true }: FeedbackToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (tts) speakText(message)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [message, tts, onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg ring-1 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${
        type === "success"
          ? "bg-success-bg text-success ring-emerald-200"
          : "bg-danger-bg text-danger ring-red-200"
      }`}
    >
      {type === "success" ? <CheckCircle2 className="size-6 shrink-0" /> : <XCircle className="size-6 shrink-0" />}
      <p className="text-base font-medium">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 shrink-0">
        <X className="size-5" />
      </button>
    </div>
  )
}
