import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const tenantId = searchParams.get("tenant_id")

    if (!email || !tenantId) {
      return NextResponse.json({ error: "Missing email or tenant_id" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Verify the user is authenticated and matches the email
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tenant with Stripe account
    const { data: tenant } = await supabase
      .from("tenants")
      .select("stripe_account_id, subdomain")
      .eq("id", tenantId)
      .single()

    if (!tenant?.stripe_account_id) {
      return NextResponse.json({ error: "Tenant does not have Stripe connected" }, { status: 400 })
    }

    // Get supporter's Stripe customer ID
    const { data: supporter } = await supabase
      .from("supporters")
      .select("stripe_customer_id")
      .eq("tenant_id", tenantId)
      .eq("email", email)
      .single()

    if (!supporter?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found for this donor" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${tenant.subdomain}.tektonstable.com`
    const returnUrl = baseUrl.includes(tenant.subdomain)
      ? `${baseUrl}/donor/recurring`
      : `https://${tenant.subdomain}.tektonstable.com/donor/recurring`

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create(
      {
        customer: supporter.stripe_customer_id,
        return_url: returnUrl,
      },
      {
        stripeAccount: tenant.stripe_account_id,
      },
    )

    // Redirect to the portal
    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error("Customer portal error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
