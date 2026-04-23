import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getEnvValue(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Supabase ortam değişkeni tanımlı değil: ${key}`)
  }
  return value
}

export function createClient() {
  const url = getEnvValue(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL")
  const anonKey = getEnvValue(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY")

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
}

export const supabase = createClient()
