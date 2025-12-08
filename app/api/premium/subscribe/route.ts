import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PREMIUM_RESOURCES_PRICE_ID, TENANT_TRIAL_DAYS } from "@/lib/stripe-premium"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { successUrl, cancelUrl } = await req.json()

    const supabaseAdmin = createAdminClient()

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("id, status, stripe_subscription_id")
      .eq("user_id", user.id)
      .single()

    if (existingSubscription?.status === "active" || existingSubscription?.status === "trialing") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 })
    }

    // Check if user is a tenant (for free trial eligibility)
    const { data: tenant } = await supabaseAdmin.from("tenants").select("id").eq("user_id", user.id).single()

    const isTenant = !!tenant

    // Get or create Stripe customer
    let stripeCustomerId = existingSubscription?.stripe_subscription_id ? undefined : undefined

    // Look up existing customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      stripeCustomerId = customers.data[0].id
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          is_tenant: isTenant ? "true" : "false",
        },
      })
      stripeCustomerId = customer.id
    }

    // Create checkout session
    const sessionConfig: any = {
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PREMIUM_RESOURCES_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url:
        successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://tektonstable.com"}/resources?subscribed=true`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://tektonstable.com"}/resources?canceled=true`,
      metadata: {
        user_id: user.id,
        subscription_type: "premium_resources",
        is_tenant: isTenant ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          subscription_type: "premium_resources",
          is_tenant: isTenant ? "true" : "false",
        },
      },
    }

    // Add free trial for tenants
    if (isTenant) {
      sessionConfig.subscription_data.trial_period_days = TENANT_TRIAL_DAYS
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[v0] Error creating premium subscription checkout:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
