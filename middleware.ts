import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getSupabaseEnvOrNull } from "@/lib/supabase/env"

export async function middleware(request: NextRequest) {
  const env = getSupabaseEnvOrNull()
  if (!env) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = new URL("/", request.url)
      redirectUrl.searchParams.set("durum", "sistem-ayari-hatasi")
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/" || pathname === "/kayit-ol"
  const isDashboardPage = pathname.startsWith("/dashboard")

  if (isDashboardPage && !user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/", "/kayit-ol", "/dashboard/:path*"],
}
