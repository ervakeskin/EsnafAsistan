// EsnafAsistan — Service Worker
// PWA desteği, offline cache ve background sync

const CACHE_NAME = "esnafasistan-v1"
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.webmanifest",
]

const API_CACHE = "api-cache-v1"

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Sadece GET isteklerini cache'le
  if (request.method !== "GET") return

  // API isteklerini cache'le (network-first)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request))
    return
  }

  // Statik dosyaları cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
  }
})

self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-sales") {
    event.waitUntil(syncSales())
  }
})

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response("Çevrimdışı", { status: 503 })
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: "Çevrimdışı" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

async function syncSales() {
  const db = await openDB()
  const pendingSales = await db.getAll("pending-sales")

  for (const sale of pendingSales) {
    try {
      const response = await fetch("/api/products/sale", {
        method: "POST",
        body: JSON.stringify(sale),
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        await db.delete("pending-sales", sale.id)
      }
    } catch {
      console.error("Sync failed for sale:", sale.id)
    }
  }
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("esnafasistan-offline", 1)
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore("pending-sales", { keyPath: "id" })
      db.createObjectStore("pending-deliveries", { keyPath: "id" })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Type declarations for Service Worker
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<unknown>): void
}

interface FetchEvent extends Event {
  request: Request
  respondWith(response: Promise<Response> | Response): void
}

interface SyncEvent extends Event {
  tag: string
  waitUntil(fn: Promise<unknown>): void
}
