"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, Send, X, Sparkles, Loader2, RotateCcw } from "lucide-react"
import { useAiChat } from "./ai-chat-provider"
import type { AiMessage } from "@/lib/ai"

const SUGGESTION_CHIPS = [
  "Bu ay en çok ne sattım?",
  "Kritik stok ürünlerim var mı?",
  "Bugünkü kasa durumum nedir?",
  "Hangi ürünüm bitmek üzere?",
  "Toplam depo değerim nedir?",
  "Bugün kaç teslimatım var?",
]

type ChatMessage = AiMessage & { id: string }

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben EsnafAsistan'ın yapay zeka asistanıyım. Stok, kasa, teslimat ve satışlarınız hakkında sorularınızı yanıtlayabilirim. Nasıl yardımcı olabilirim?",
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
          <Bot className="size-3.5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-black/[0.04] dark:bg-white/[0.07] text-foreground rounded-tl-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

/** Sidebar/header'da render edilen küçük trigger buton */
export function AiChatTrigger({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "header"
}) {
  const { openChat } = useAiChat()

  if (variant === "header") {
    return (
      <button
        onClick={openChat}
        aria-label="AI Asistanı Aç"
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-white hover:brightness-110 transition-all"
      >
        <Sparkles className="size-4" />
        Yardım
      </button>
    )
  }

  return (
    <button
      onClick={openChat}
      aria-label="AI Asistanı Aç"
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-150"
    >
      <Sparkles className="size-4 shrink-0 text-primary" />
      <span>AI Asistan</span>
    </button>
  )
}

/** Sayfada bir kez render edilen gerçek drawer */
export function AiChatDrawer() {
  const { open, closeChat } = useAiChat()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200)
  }, [open])

  // ESC ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeChat()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, closeChat])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || loading) return

      const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: trimmed }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setLoading(true)
      setError(null)

      const history: AiMessage[] = [
        ...messages
          .filter((m) => m.id !== "welcome")
          .map(({ role, content }) => ({ role, content })),
        { role: "user", content: trimmed },
      ]

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Bilinmeyen hata")
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.")
      } finally {
        setLoading(false)
      }
    },
    [messages, loading],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const reset = () => {
    setMessages([WELCOME])
    setError(null)
  }

  const showChips = messages.length <= 1 && !loading

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity"
          onClick={closeChat}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="AI Asistan"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white/96 dark:bg-[#1c1c1e]/96 backdrop-blur-xl transition-transform duration-300 ease-out [box-shadow:-4px_0_32px_rgba(0,0,0,0.10)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 [border-bottom:1px_solid_rgba(0,0,0,0.06)] dark:[border-bottom:1px_solid_rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Asistan</p>
              <p className="text-xs text-muted-foreground">Gemini 2.0 Flash · Canlı verilerle</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              aria-label="Sohbeti sıfırla"
              title="Sohbeti sıfırla"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              onClick={closeChat}
              aria-label="Kapat"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Loader2 className="size-3.5 text-primary animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-black/[0.04] dark:bg-white/[0.07] px-4 py-3 flex gap-1.5 items-center">
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-[rgba(185,28,28,0.08)] px-3.5 py-2.5 text-sm text-[#b91c1c]">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Hazır soru çipleri */}
        {showChips && (
          <div className="px-4 pb-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Hızlı sorular
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/[0.15] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-5 pt-2 [border-top:1px_solid_rgba(0,0,0,0.06)] dark:[border-top:1px_solid_rgba(255,255,255,0.06)]">
          <div className="flex items-end gap-2 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir şey sorun… (Enter ile gönder)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none disabled:opacity-50 max-h-32"
              style={{ lineHeight: "1.5" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Gönder"
              className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-35 hover:brightness-110 transition-all active:scale-95"
            >
              <Send className="size-3.5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
            AI yanıtları hatalı olabilir. Kritik kararlar için doğrulayın.
          </p>
        </div>
      </div>
    </>
  )
}
