type SupabaseEnv = {
  url: string
  anonKey: string
}

const REQUIRED_URL_KEY = "NEXT_PUBLIC_SUPABASE_URL"
const REQUIRED_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
const ERROR_MESSAGE = "Supabase ortam değişkenleri tanımlı değil veya geçersiz."

function resolveSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    return {
      env: null,
      reason: `${REQUIRED_URL_KEY} bulunamadı. Vercel ve yerel .env ayarlarını kontrol et.`,
    }
  }

  if (!anonKey) {
    return {
      env: null,
      reason: `${REQUIRED_ANON_KEY} bulunamadı. Vercel ve yerel .env ayarlarını kontrol et.`,
    }
  }

  try {
    new URL(url)
  } catch {
    return {
      env: null,
      reason: `${REQUIRED_URL_KEY} geçerli bir URL değil: ${url}`,
    }
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
