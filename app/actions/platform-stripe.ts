"use server"

import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function generatePlatformStripeConnectUrl() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is super admin
  const { data: isSuperAdmin } = await supabase.from("super_admins").select("id").eq("id", user.id).single()

  if (!isSuperAdmin) {
    throw new Error("Unauthorized - Super admin access required")
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/settings/stripe-callback`

  const authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=platform_connect`

  return authUrl
}

export async function disconnectPlatformStripe() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if user is super admin
  const { data: isSuperAdmin } = await supabase.from("super_admins").select("id").eq("id", user.id).single()

  if (!isSuperAdmin) {
    throw new Error("Unauthorized - Super admin access required")
  }

  // Get current settings
  const { data: settings } = await supabase.from("platform_settings").select("stripe_account_id").single()

  if (settings?.stripe_account_id) {
    try {
      // Revoke access to the connected account
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CLIENT_ID!,
        stripe_user_id: settings.stripe_account_id,
      })
    } catch (error) {
      console.error("Error revoking Stripe access:", error)
    }
  }

  // Clear Stripe data from platform settings
  const { error } = await supabase
    .from("platform_settings")
    .update({
      stripe_account_id: null,
      stripe_account_email: null,
      stripe_connected_at: null,
    })
    .eq("id", 1)

  if (error) {
    throw new Error("Failed to disconnect Stripe account")
  }

  return { success: true }
}

export async function getPlatformStripeStatus() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { connected: false }
  }

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("stripe_account_id, stripe_account_email, stripe_connected_at")
    .single()

  return {
    connected: !!settings?.stripe_account_id,
    accountId: settings?.stripe_account_id,
    accountEmail: settings?.stripe_account_email,
    connectedAt: settings?.stripe_connected_at,
  }
}
