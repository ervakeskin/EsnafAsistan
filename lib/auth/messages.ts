const SUPABASE_CONFIG_ERROR_FRAGMENT = "Supabase ortam değişkenleri tanımlı değil"

export const AUTH_CONFIG_ERROR_MESSAGE =
  "Sistem ayarlarında bağlantı sorunu var. Lütfen biraz sonra tekrar deneyin."

export function isSupabaseConfigError(error: unknown) {
  return error instanceof Error && error.message.includes(SUPABASE_CONFIG_ERROR_FRAGMENT)
}

export function getUnknownErrorMessage(defaultMessage: string, error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return defaultMessage
}
