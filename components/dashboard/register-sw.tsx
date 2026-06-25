"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Service Worker kaydedildi:", registration.scope)
        })
        .catch((error) => {
          console.error("[SW] Service Worker kaydedilemedi:", error)
        })
    }
  }, [])

  return null
}
