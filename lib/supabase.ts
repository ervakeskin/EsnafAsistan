import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { getSupabaseEnv } from "@/lib/supabase/env"

export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
}
