import { createBrowserClient } from "@supabase/ssr"

import { getSupabaseEnv } from "@/lib/supabase/env"

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  return createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
}
