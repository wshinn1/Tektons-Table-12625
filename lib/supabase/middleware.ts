import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = {
            ...options,
            domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            maxAge: options?.maxAge || 60 * 60 * 24 * 365, // 1 year default
          }
          supabaseResponse.cookies.set(name, value, cookieOptions)
        })
      },
    },
  })

  let user = null
  if (!request.nextUrl.pathname.startsWith("/auth/callback")) {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        // Silently handle auth errors - user will be null
        // This prevents "Invalid Refresh Token" errors from flooding logs
      } else {
        user = data?.user
      }
    } catch (e) {
      // Silently handle any auth errors for anonymous users
    }
  }

  const host = request.headers.get("host") || ""
  const hostname = host.split(":")[0]
  const parts = hostname.split(".")

  const isV0Preview = hostname.endsWith(".vusercontent.net") || hostname.endsWith(".vercel.app")
  const isMainDomain = parts.length <= 2 || hostname === "localhost" || hostname.startsWith("localhost:") || isV0Preview
  const subdomain = !isMainDomain ? parts[0] : null

  const isMarketingPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/about" ||
    request.nextUrl.pathname === "/pricing" ||
    request.nextUrl.pathname === "/features" ||
    request.nextUrl.pathname === "/contact" ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/api/")

  if (subdomain && !isMarketingPage) {
    const url = request.nextUrl.clone()

    // Rewrite subdomain URLs to the [tenant] dynamic route
    url.pathname = `/${subdomain}${request.nextUrl.pathname}`

    const response = NextResponse.rewrite(url)

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      const cookieOptions = {
        ...cookie.options,
        domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      }
      response.cookies.set(cookie.name, cookie.value, cookieOptions)
    })

    // Store subdomain in headers for components to access
    response.headers.set("x-subdomain", subdomain)

    return response
  }

  // Main domain - let through as normal
  if (isMainDomain && request.nextUrl.pathname === "/") {
    return supabaseResponse
  }

  // Store subdomain in headers for use in components
  const requestHeaders = new Headers(request.headers)
  if (subdomain) {
    requestHeaders.set("x-subdomain", subdomain)
  }

  // Redirect unauthenticated users trying to access protected routes
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/onboarding"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === "/dashboard") {
    try {
      const { data: tenant } = await supabase.from("tenants").select("id").eq("id", user.id).single()

      if (!tenant && request.nextUrl.pathname !== "/onboarding") {
        const url = request.nextUrl.clone()
        url.pathname = "/onboarding"
        return NextResponse.redirect(url)
      }
    } catch (e) {
      // Silently handle tenant lookup errors
    }
  }

  return supabaseResponse
}
