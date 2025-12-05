"use server"

import { createClient } from "@/lib/supabase/server"

export async function getStripeConnectUrl(tenantId: string, subdomain: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify user owns this tenant
  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

  if (!tenant || tenant.id !== user.id) {
    throw new Error("Unauthorized")
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim()

  if (!clientId) {
    throw new Error("Stripe Connect not configured. Please add STRIPE_CONNECT_CLIENT_ID to your environment variables.")
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/stripe/connect/callback`

  console.log("[v0] Redirect URI:", redirectUri)

  const state = `${tenantId}:${subdomain}:${Date.now()}`

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state: state,
  })

  console.log("[v0] OAuth URL:", `https://connect.stripe.com/oauth/authorize?${params.toString()}`)

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

export async function disconnectStripeAccount(tenantId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

  if (!tenant || tenant.id !== user.id) {
    throw new Error("Unauthorized")
  }

  if (tenant.stripe_account_id) {
    // Deauthorize the account
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!)

    try {
      await fetch("https://connect.stripe.com/oauth/deauthorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.STRIPE_CONNECT_CLIENT_ID!.trim(),
          stripe_user_id: tenant.stripe_account_id,
        }),
      })
    } catch (error) {
      console.error("Error disconnecting Stripe account:", error)
    }
  }

  await supabase
    .from("tenants")
    .update({
      stripe_account_id: null,
      stripe_account_status: "not_connected",
      stripe_connected_at: null,
    })
    .eq("id", tenantId)

  return { success: true }
}
