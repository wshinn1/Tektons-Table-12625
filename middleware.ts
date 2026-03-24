import { updateSession } from "@/lib/supabase/middleware"
import { type NextRequest, NextResponse } from "next/server"

// Handles subdomain routing and session management
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("x-forwarded-host") || request.headers.get("host") || ""
  const path = request.nextUrl.pathname
  
  // Debug logging for admin routes
  if (path.includes("/admin/")) {
    console.log("[v0] ROOT middleware - hostname:", hostname, "path:", path)
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter(c => c.name.includes("auth") || c.name.includes("sb-"))
    console.log("[v0] ROOT middleware - all cookies:", allCookies.map(c => c.name).join(", "))
    console.log("[v0] ROOT middleware - auth cookies:", authCookies.map(c => `${c.name}=${c.value?.substring(0,20)}...`).join(", "))
  }

  const isBuilderPreview = path.startsWith("/builder-preview")

  const isTenantSubdomain =
    hostname.includes(".tektonstable.com") && !["www", "admin", "api"].includes(hostname.split(".tektonstable.com")[0])

  if (isBuilderPreview) {
    // Return early with proper headers for Builder.io
    const response = NextResponse.next()
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self' https://*.builder.io https://builder.io")
    response.headers.delete("X-Frame-Options")
    response.headers.delete("x-frame-options")
    return response
  }

  const searchParams = request.nextUrl.searchParams
  const hasBuilderParam =
    searchParams.has("builder.preview") ||
    searchParams.get("builder.preview") === "true" ||
    request.headers.get("referer")?.includes("builder.io")

  const isEmbedMode = searchParams.has("embed") || searchParams.get("embed") === "true"

  const isRootDomain =
    hostname === "tektonstable.com" ||
    hostname === "www.tektonstable.com" ||
    hostname === "localhost:3000" ||
    hostname === "localhost" ||
    hostname.endsWith(".vusercontent.net") ||
    hostname.endsWith(".vercel.app")

  let subdomain = ""

  // Extract subdomain from hostname
  if (!isRootDomain && hostname.includes(".tektonstable.com")) {
    const extractedSubdomain = hostname.split(".tektonstable.com")[0]

    if (extractedSubdomain && !["www", "admin", "api"].includes(extractedSubdomain)) {
      subdomain = extractedSubdomain
    }
  }

  if (isRootDomain && path.includes("/preview-")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    const response = NextResponse.rewrite(url)
    response.headers.set("x-is-root-domain", "true")
    response.headers.set("x-tenant-subdomain", "")
    await updateSession(request)
    return response
  }

  // Update session and get response
  let response = await updateSession(request)
  
  // Debug logging for admin routes - check what cookies are on the response
  if (path.includes("/admin/") && response instanceof NextResponse) {
    console.log("[v0] ROOT middleware - after updateSession, response cookies:", response.cookies.getAll().map(c => c.name).join(", "))
  }

  if ((isTenantSubdomain || isEmbedMode) && response instanceof NextResponse) {
    // Allow embedding from any origin for tenant sites
    response.headers.delete("X-Frame-Options")
    response.headers.delete("x-frame-options")
    response.headers.set("Content-Security-Policy", "frame-ancestors *")
    // Set embed mode header so the layout can detect it
    if (isEmbedMode) {
      response.headers.set("x-embed-mode", "true")
    }
  }

  if (hasBuilderParam && response instanceof NextResponse) {
    response.headers.delete("X-Frame-Options")
    response.headers.delete("x-frame-options")
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self' https://*.builder.io https://builder.io")
  }

  if (subdomain && response instanceof NextResponse) {
    // Helper to copy cookies from original response to new response
    const copyResponseCookies = (originalResponse: NextResponse, newResponse: NextResponse) => {
      originalResponse.cookies.getAll().forEach((cookie) => {
        newResponse.cookies.set(cookie.name, cookie.value, {
          domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        })
      })
    }

    if (path.startsWith(`/${subdomain}`)) {
      response.headers.set("x-tenant-subdomain", subdomain)
      return response
    }

    if (path.startsWith("/admin")) {
      const url = request.nextUrl.clone()
      url.pathname = `/${subdomain}${path}`
      const newResponse = NextResponse.rewrite(url)
      copyResponseCookies(response, newResponse)
      newResponse.headers.set("x-tenant-subdomain", subdomain)
      return newResponse
    }

    response.headers.set("x-tenant-subdomain", subdomain)

    // This allows tenant-specific login pages like /auth/donor-login and /auth/login
    // Also rewrite /blog paths to tenant blog on subdomains
    if (
      !path.startsWith(`/${subdomain}`) &&
      (path === "/" ||
        path.startsWith("/auth") || // Rewrite auth paths for tenant subdomains
        path.startsWith("/blog") || // Rewrite blog paths for tenant subdomains
        (!path.startsWith("/api") &&
          !path.startsWith("/dashboard") &&
          !path.startsWith("/help") &&
          !path.startsWith("/how-it-works") &&
          !path.startsWith("/supporter")))
    ) {
      // Rewrite to tenant route
      const url = request.nextUrl.clone()
      url.pathname = `/${subdomain}${path}`
      const newResponse = NextResponse.rewrite(url)
      copyResponseCookies(response, newResponse)
      newResponse.headers.set("x-tenant-subdomain", subdomain)
      response = newResponse
    }
  } else if (isRootDomain) {
    if (response instanceof NextResponse) {
      response.headers.set("x-is-root-domain", "true")
      response.headers.set("x-tenant-subdomain", "")
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
