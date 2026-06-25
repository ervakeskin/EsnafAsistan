import { createAdminClient } from "@/lib/supabase/server"

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false

  const permission = await Notification.requestPermission()
  return permission === "granted"
}

export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push bildirimler desteklenmiyor.")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const keyStr = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
    const keyBuffer = keyStr ? Uint8Array.from(atob(keyStr.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)).buffer : undefined
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBuffer as ArrayBuffer | undefined,
    })

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    })

    return subscription
  } catch (error) {
    console.error("Push abonelik hatası:", error)
    return null
  }
}

export async function sendPushNotification(userId: string, title: string, body: string) {
  try {
    const adminClient = createAdminClient()
    const { data: subscriptions } = await adminClient
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)

    if (!subscriptions) return

    for (const sub of subscriptions) {
      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${process.env.FIREBASE_SERVER_KEY ?? ""}`,
        },
        body: JSON.stringify({
          to: (sub.subscription as { endpoint: string }).endpoint,
          notification: { title, body, icon: "/favicon.ico" },
        }),
      })
    }
  } catch (error) {
    console.error("Push bildirim gönderilemedi:", error)
  }
}


