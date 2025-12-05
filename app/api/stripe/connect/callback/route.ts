import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  console.log("[v0] Stripe callback - code:", code ? "present" : "missing")
  console.log("[v0] Stripe callback - state:", state)
  console.log("[v0] Stripe callback - error:", error)

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL(`/?error=missing_params`, request.url))
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const stateParts = state.split(":")
  const tenantId = stateParts[0]
  const subdomain = stateParts[1]
  const timestamp = stateParts[2] ? Number.parseInt(stateParts[2]) : null

  console.log("[v0] Parsed state - tenantId:", tenantId, "subdomain:", subdomain, "timestamp:", timestamp)

  if (timestamp) {
    const now = Date.now()
    const age = now - timestamp
    const tenMinutes = 10 * 60 * 1000

    if (age > tenMinutes) {
      console.error("[v0] Authorization code expired. Age:", age, "ms")
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const url = new URL(baseUrl)
      const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=expired_code`
      return NextResponse.redirect(tenantUrl)
    }
  }

  // Verify user owns this tenant
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

  if (!tenant || tenant.id !== user.id) {
    console.error("[v0] Unauthorized - tenant id:", tenant?.id, "user id:", user.id)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const url = new URL(baseUrl)
    const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=unauthorized`
    return NextResponse.redirect(tenantUrl)
  }

  // Exchange authorization code for access token
  try {
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim()
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim()

    if (!clientId) {
      console.error("[v0] STRIPE_CONNECT_CLIENT_ID is not set")
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const url = new URL(baseUrl)
      const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=config_error`
      return NextResponse.redirect(tenantUrl)
    }

    if (!secretKey) {
      console.error("[v0] STRIPE_SECRET_KEY is not set")
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const url = new URL(baseUrl)
      const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=config_error`
      return NextResponse.redirect(tenantUrl)
    }

    console.log("[v0] Exchanging code with Stripe, client_id:", clientId.substring(0, 10) + "...")

    const basicAuth = Buffer.from(`${secretKey}:`).toString("base64")

    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: clientId,
      }),
    })

    const data = await response.json()

    console.log("[v0] Stripe response:", data.error ? `Error: ${data.error} - ${data.error_description}` : "Success")

    if (data.error) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const url = new URL(baseUrl)
      const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=${data.error}`
      return NextResponse.redirect(tenantUrl)
    }

    // Store the connected account ID
    await supabase
      .from("tenants")
      .update({
        stripe_account_id: data.stripe_user_id,
        stripe_account_status: "connected",
        stripe_connected_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    console.log("[v0] Successfully connected Stripe account:", data.stripe_user_id)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const url = new URL(baseUrl)
    const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?success=connected`
    return NextResponse.redirect(tenantUrl)
  } catch (err) {
    console.error("[v0] Stripe Connect error:", err)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const url = new URL(baseUrl)
    const tenantUrl = `${url.protocol}//${subdomain}.${url.hostname}/admin/giving?error=connection_failed`
    return NextResponse.redirect(tenantUrl)
  }
}
