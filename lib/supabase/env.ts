type SupabaseEnv = {
  url: string
  anonKey: string
}

const ERROR_MESSAGE = "Supabase ortam değişkenleri tanımlı değil."

function readValue(primaryKey: string, fallbackKey: string) {
  return process.env[primaryKey] ?? process.env[fallbackKey]
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = readValue("NEXT_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL")
  const anonKey = readValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", "EXPO_PUBLIC_SUPABASE_ANON_KEY")

  if (!url || !anonKey) {
    throw new Error(ERROR_MESSAGE)
  }

  return { url, anonKey }
}
