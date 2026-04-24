type SupabaseEnv = {
  url: string
  anonKey: string
}

const ERROR_MESSAGE = "Supabase ortam değişkenleri tanımlı değil."
const URL_ERROR_MESSAGE = "NEXT_PUBLIC_SUPABASE_URL geçerli bir URL değil."

function readValue(primaryKey: string, fallbackKey: string) {
  return process.env[primaryKey] ?? process.env[fallbackKey]
}

function resolveSupabaseEnv() {
  const url = readValue("NEXT_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL")
  const anonKey = readValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", "EXPO_PUBLIC_SUPABASE_ANON_KEY")

  if (!url || !anonKey) {
    return { env: null, reason: ERROR_MESSAGE }
  }

  try {
    // URL parse check prevents silent prod misconfiguration.
    new URL(url)
  } catch {
    return { env: null, reason: URL_ERROR_MESSAGE }
  }

  return { env: { url, anonKey }, reason: null }
}

export function getSupabaseEnvOrNull(): SupabaseEnv | null {
  const { env, reason } = resolveSupabaseEnv()
  if (!env) {
    console.error(`[SupabaseEnv] ${reason}`)
    return null
  }

  return env
}

export function getSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnvOrNull()
  if (!env) {
    throw new Error(ERROR_MESSAGE)
  }

  return env
}
