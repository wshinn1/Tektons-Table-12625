import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { returnUrl } = await req.json()

    const supabaseAdmin = createAdminClient()

    // Get user's subscription
    const { data: subscription } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://tektonstable.com"}/resources`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[v0] Error creating billing portal session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
