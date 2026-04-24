import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getSupabaseEnv } from "@/lib/supabase/env"

export async function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Cookies can only be modified in a Server Action or Route Handler")
          ) {
            return
          }

          throw error
        }
      },
    },
  })
}
