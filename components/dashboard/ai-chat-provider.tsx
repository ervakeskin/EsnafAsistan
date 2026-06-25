"use client"

/**
 * components/dashboard/ai-chat-provider.tsx
 * Global AI Chat state — hem sidebar butonu hem de Yardım butonu
 * aynı drawer'ı açabilsin diye Context kullanıyoruz.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type AiChatContextType = {
  open: boolean
  openChat: () => void
  closeChat: () => void
}

const AiChatContext = createContext<AiChatContextType>({
  open: false,
  openChat: () => {},
  closeChat: () => {},
})

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openChat = useCallback(() => setOpen(true), [])
  const closeChat = useCallback(() => setOpen(false), [])

  return (
    <AiChatContext.Provider value={{ open, openChat, closeChat }}>
      {children}
    </AiChatContext.Provider>
  )
}

export function useAiChat() {
  return useContext(AiChatContext)
}
