const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN) return
  console.info("[Sentry] Sentry DSN mevcut, hata izleme aktif.")
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    if (error instanceof Error) {
      console.error("[Sentry Mock] Hata yakalandı:", error.message, context ?? "")
    }
    return
  }

  try {
    fetch("https://o4500000000000000000.ingest.de.sentry.io/api/4500000000000000/envelope/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dsn: SENTRY_DSN,
        event: {
          message: error instanceof Error ? error.message : String(error),
          level: "error",
          contexts: context,
          timestamp: new Date().toISOString(),
        },
      }),
    })
  } catch {
    console.error("[Sentry] Gönderim başarısız.")
  }
}
