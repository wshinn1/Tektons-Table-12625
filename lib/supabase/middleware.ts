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

  // Check if the user-agent suggests Safari (ITP issues)
  const userAgent = request.headers.get('user-agent') || ''
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
  const pathname = request.nextUrl.pathname
  
  // Log Safari requests to admin routes for debugging
  if (isSafari && pathname.includes('/admin')) {
    console.log("[v0] Safari detected in middleware - UA:", userAgent.substring(0, 100))
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(c => c.name.includes('auth') || c.name.startsWith('sb-'))
    console.log("[v0] Safari middleware cookies:", authCookies.map(c => `${c.name}=${c.value.substring(0,30)}...`))
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        const cookies = request.cookies.getAll()
        
        // Extra logging for Safari on admin routes
        if (isSafari && pathname.includes('/admin')) {
          console.log("[v0] Safari getAll cookies:", cookies.map(c => c.name).join(', '))
        }
        
        return cookies
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
  const isAdminRoute = pathname.includes("/admin/")
  
  if (!pathname.startsWith("/auth/callback")) {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        // Log auth errors for admin routes to help debug login loop issues
        if (isAdminRoute) {
          console.log("[v0] Middleware auth error on admin route:", pathname, error.message)
        }
      } else {
        user = data?.user
        if (isAdminRoute) {
          console.log("[v0] Middleware user on admin route:", pathname, user?.email)
        }
      }
    } catch (e) {
      // Silently handle any auth errors for anonymous users
      if (isAdminRoute) {
        console.log("[v0] Middleware catch error on admin route:", pathname, e)
      }
    }
  }

  // NOTE: Subdomain routing is handled by the root middleware.ts
  // This function only handles session management and main domain auth redirects.
  
  // Redirect unauthenticated users trying to access protected routes on main domain
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/onboarding"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Check if user needs onboarding on main domain
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
