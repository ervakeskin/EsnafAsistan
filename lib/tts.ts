"use client"

export function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "tr-TR"
  utterance.rate = 0.9
  utterance.pitch = 1.0
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}
