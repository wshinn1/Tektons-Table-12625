import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || requestUrl.searchParams.get("redirect") || "/onboarding"
  const origin = requestUrl.origin

  console.log("[v0] ========== AUTH CALLBACK ROUTE START ==========")
  console.log("[v0] Code present:", !!code)
  console.log("[v0] Next:", next)
  console.log("[v0] Origin:", origin)

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
                })
              })
            } catch {
              // Ignore errors in read-only contexts
            }
          },
        },
      },
    )

    try {
      console.log("[v0] Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[v0] Code exchange error:", error.message)

        // If PKCE fails (different browser), redirect to login with a message
        if (error.message.includes("code verifier")) {
          console.log("[v0] PKCE verification failed - user likely clicked link in different browser")
          return NextResponse.redirect(
            `${origin}/auth/login?message=${encodeURIComponent("Your email has been verified! Please log in to continue.")}`,
          )
        }

        return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message)}`)
      }

      console.log("[v0] Session created successfully")
      console.log("[v0] User ID:", data.user?.id)
      console.log("[v0] User email:", data.user?.email)

      // This allows subscription flows to work even for users with tenant sites
      if (next && next !== "/onboarding") {
        console.log("[v0] Explicit redirect requested:", next)
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Check if user has completed onboarding
      if (data.user?.email) {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("subdomain, onboarding_completed")
          .eq("email", data.user.email)
          .maybeSingle()

        if (tenant?.onboarding_completed && tenant?.subdomain) {
          // User has completed onboarding, redirect to their subdomain
          const tenantUrl = `https://${tenant.subdomain}.tektonstable.com`
          console.log("[v0] Redirecting to tenant subdomain:", tenantUrl)
          return NextResponse.redirect(tenantUrl)
        }
      }

      // Redirect to onboarding or next page
      console.log("[v0] Redirecting to:", next)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent("An unexpected error occurred")}`)
    }
  }

  // No code provided, redirect to login
  console.log("[v0] No code provided, redirecting to login")
  return NextResponse.redirect(`${origin}/auth/login`)
}
