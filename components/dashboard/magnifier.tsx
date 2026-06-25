"use client"

import { useEffect, useState } from "react"

export function Magnifier() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!enabled) return

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (target?.dataset?.magnify) {
        target.style.fontSize = `${parseInt(getComputedStyle(target).fontSize) * 1.5}px`
        setTimeout(() => { target.style.fontSize = "" }, 3000)
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [enabled])

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`fixed bottom-4 left-4 z-50 rounded-full p-3 shadow-lg transition-colors ${
        enabled ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
      }`}
      title={enabled ? "Büyüteci Kapat" : "Büyüteci Aç"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
    </button>
  )
}
