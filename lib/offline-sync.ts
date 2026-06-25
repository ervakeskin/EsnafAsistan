// Offline senkronizasyon yardımcısı
// IndexedDB üzerinden çevrimdışı veri depolama ve senkronizasyon

export interface PendingSale {
  id: string
  productId: string
  quantity: number
  salePrice: number
  paymentType: string
  customerName: string
  createdAt: string
}

export interface PendingDelivery {
  id: string
  supplierName: string
  productName: string
  quantity: number
  expectedDate: string
  createdAt: string
}

export async function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("esnafasistan-offline", 2)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("pending-sales")) {
        db.createObjectStore("pending-sales", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("pending-deliveries")) {
        db.createObjectStore("pending-deliveries", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("cached-products")) {
        db.createObjectStore("cached-products", { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePendingSale(sale: PendingSale): Promise<void> {
  const db = await openOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending-sales", "readwrite")
    tx.objectStore("pending-sales").add(sale)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await openOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending-sales", "readonly")
    const request = tx.objectStore("pending-sales").getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearPendingSales(): Promise<void> {
  const db = await openOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending-sales", "readwrite")
    tx.objectStore("pending-sales").clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function cacheProducts(products: Array<{ id: string; name: string; quantity: number; unit: string }>) {
  const db = await openOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached-products", "readwrite")
    const store = tx.objectStore("cached-products")
    for (const product of products) {
      store.put(product)
    }
    tx.oncomplete = () => resolve(undefined)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedProducts(): Promise<Array<{ id: string; name: string; quantity: number; unit: string }>> {
  const db = await openOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached-products", "readonly")
    const request = tx.objectStore("cached-products").getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
