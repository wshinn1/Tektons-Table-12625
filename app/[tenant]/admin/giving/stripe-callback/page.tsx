import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function StripeCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ code?: string; state?: string; error?: string }>
}) {
  const { tenant: subdomain } = await params
  const { code, state, error } = await searchParams

  if (error) {
    redirect(`/admin/giving?error=${error}`)
  }

  if (!code || !state) {
    redirect(`/admin/giving?error=missing_params`)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login`)
  }

  // Parse state to get tenant ID
  const [tenantId] = state.split(":")

  // Verify user owns this tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .eq("subdomain", subdomain)
    .single()

  if (!tenant || tenant.id !== user.id) {
    redirect(`/admin/giving?error=unauthorized`)
  }

  // Exchange authorization code for access token
  try {
    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
      }),
    })

    const data = await response.json()

    if (data.error) {
      redirect(`/admin/giving?error=${data.error}`)
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

    redirect(`/admin/giving?success=connected`)
  } catch (err) {
    console.error("Stripe Connect error:", err)
    redirect(`/admin/giving?error=connection_failed`)
  }
}
