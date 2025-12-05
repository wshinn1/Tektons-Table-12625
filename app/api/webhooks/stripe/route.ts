import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

// Use service role client for webhook processing (bypasses RLS)
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  const webhookSecrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter(
    Boolean,
  ) as string[]

  if (webhookSecrets.length === 0) {
    console.error("[v0] No Stripe webhook secret configured")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  if (!signature) {
    console.error("[v0] No Stripe signature in request")
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event | null = null
  let lastError: any = null

  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret)
      console.log("[v0] Webhook signature verified with secret")
      break
    } catch (err: any) {
      lastError = err
      console.log("[v0] Signature verification failed with secret, trying next...")
    }
  }

  if (!event) {
    console.error("[v0] Webhook signature verification failed with all secrets:", lastError?.message)
    console.error("[v0] Available secrets count:", webhookSecrets.length)
    console.error("[v0] Signature received:", signature?.substring(0, 50) + "...")
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  console.log("[v0] Received Stripe webhook event:", event.type)
  if (event.account) {
    console.log("[v0] Event from connected account:", event.account)
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[v0] Processing checkout.session.completed:", session.id)
  console.log("[v0] Session metadata:", session.metadata)

  const metadata = session.metadata || {}
  const tenantId = metadata.tenant_id
  const donationAmount = Number.parseFloat(metadata.donation_amount || "0")
  const tipAmount = Number.parseFloat(metadata.tip_amount || "0")
  const totalAmount = Number.parseFloat(metadata.total_amount || "0")
  const feeModel = metadata.fee_model || "donor_tips"
  const campaignId = metadata.campaign_id || null
  const authenticatedUserId = metadata.authenticated_user_id || null

  if (!tenantId) {
    console.error("[v0] No tenant_id in session metadata")
    return
  }

  const customerEmail = session.customer_details?.email || session.customer_email
  const customerName = session.customer_details?.name || "Anonymous"

  // Calculate platform fee
  let platformFee = 0
  if (feeModel === "platform_fee") {
    // Get platform fee percentage from config
    const { data: feeConfig } = await supabaseAdmin
      .from("platform_fee_config")
      .select("base_fee_percentage")
      .order("effective_date", { ascending: false })
      .limit(1)
      .single()

    const feePercentage = feeConfig?.base_fee_percentage || 3.5
    platformFee = (donationAmount * feePercentage) / 100
  } else if (feeModel === "donor_tips") {
    platformFee = tipAmount
  }

  // Find or create supporter
  let supporterId = null
  if (customerEmail) {
    // Check if supporter exists
    const { data: existingSupporter } = await supabaseAdmin
      .from("tenant_financial_supporters")
      .select("id, total_given")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .single()

    if (existingSupporter) {
      supporterId = existingSupporter.id
      // Update supporter totals
      await supabaseAdmin
        .from("tenant_financial_supporters")
        .update({
          total_given: (existingSupporter.total_given || 0) + donationAmount,
          last_gift_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", supporterId)
    } else {
      // Create new supporter
      const { data: newSupporter } = await supabaseAdmin
        .from("tenant_financial_supporters")
        .insert({
          tenant_id: tenantId,
          email: customerEmail,
          name: customerName,
          total_given: donationAmount,
          first_gift_at: new Date().toISOString(),
          last_gift_at: new Date().toISOString(),
          user_id: authenticatedUserId || null,
          stripe_customer_id: (session.customer as string) || null,
          monthly_amount: session.mode === "subscription" ? donationAmount : 0,
        })
        .select("id")
        .single()

      supporterId = newSupporter?.id
    }
  }

  // Record the donation
  const isRecurring = session.mode === "subscription"

  const { error: donationError } = await supabaseAdmin.from("tenant_donations").insert({
    tenant_id: tenantId,
    supporter_id: supporterId,
    amount: donationAmount,
    type: isRecurring ? "recurring" : "one-time",
    status: "completed",
    stripe_payment_id: (session.payment_intent as string) || session.id,
    stripe_subscription_id: (session.subscription as string) || null,
    donated_at: new Date().toISOString(),
  })

  if (donationError) {
    console.error("[v0] Error inserting donation:", donationError)
  } else {
    console.log("[v0] Donation recorded successfully")
  }

  // If there's a campaign, update campaign donations
  if (campaignId) {
    // Insert into campaign_donations
    const { error: campaignDonationError } = await supabaseAdmin.from("campaign_donations").insert({
      campaign_id: campaignId,
      amount: donationAmount,
    })

    if (campaignDonationError) {
      console.error("[v0] Error inserting campaign donation:", campaignDonationError)
    }

    // Update campaign current_amount
    const { data: campaign } = await supabaseAdmin
      .from("tenant_campaigns")
      .select("current_amount")
      .eq("id", campaignId)
      .single()

    if (campaign) {
      await supabaseAdmin
        .from("tenant_campaigns")
        .update({
          current_amount: (campaign.current_amount || 0) + donationAmount,
        })
        .eq("id", campaignId)
    }
  }

  // Update tenant's total donations
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("total_donations, total_platform_fees")
    .eq("id", tenantId)
    .single()

  if (tenant) {
    await supabaseAdmin
      .from("tenants")
      .update({
        total_donations: (tenant.total_donations || 0) + donationAmount,
        total_platform_fees: (tenant.total_platform_fees || 0) + platformFee,
        last_donation_at: new Date().toISOString(),
      })
      .eq("id", tenantId)
  }

  // Update tenant giving settings fundraising amount if applicable
  const { data: givingSettings } = await supabaseAdmin
    .from("tenant_giving_settings")
    .select("fundraising_start_amount")
    .eq("tenant_id", tenantId)
    .single()

  if (givingSettings) {
    await supabaseAdmin
      .from("tenant_giving_settings")
      .update({
        fundraising_start_amount: (givingSettings.fundraising_start_amount || 0) + donationAmount,
      })
      .eq("tenant_id", tenantId)
  }

  console.log("[v0] Checkout completed processing finished for tenant:", tenantId)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("[v0] Processing invoice.paid:", invoice.id)

  // This handles recurring subscription payments after the first one
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return

  const metadata = invoice.subscription_details?.metadata || {}
  const tenantId = metadata.tenant_id
  const donationAmount = Number.parseFloat(metadata.donation_amount || "0")
  const campaignId = metadata.campaign_id || null

  if (!tenantId || !donationAmount) {
    console.log("[v0] Missing tenant_id or donation_amount in subscription metadata")
    return
  }

  const customerEmail = invoice.customer_email

  // Find supporter
  let supporterId = null
  if (customerEmail) {
    const { data: supporter } = await supabaseAdmin
      .from("tenant_financial_supporters")
      .select("id, total_given")
      .eq("tenant_id", tenantId)
      .eq("email", customerEmail)
      .single()

    if (supporter) {
      supporterId = supporter.id
      // Update supporter totals
      await supabaseAdmin
        .from("tenant_financial_supporters")
        .update({
          total_given: (supporter.total_given || 0) + donationAmount,
          last_gift_at: new Date().toISOString(),
        })
        .eq("id", supporterId)
    }
  }

  // Record the recurring donation
  await supabaseAdmin.from("tenant_donations").insert({
    tenant_id: tenantId,
    supporter_id: supporterId,
    amount: donationAmount,
    type: "recurring",
    status: "completed",
    stripe_payment_id: (invoice.payment_intent as string) || invoice.id,
    stripe_subscription_id: subscriptionId,
    donated_at: new Date().toISOString(),
  })

  // Update tenant totals
  const { data: tenant } = await supabaseAdmin.from("tenants").select("total_donations").eq("id", tenantId).single()

  if (tenant) {
    await supabaseAdmin
      .from("tenants")
      .update({
        total_donations: (tenant.total_donations || 0) + donationAmount,
        last_donation_at: new Date().toISOString(),
      })
      .eq("id", tenantId)
  }

  // Update campaign if applicable
  if (campaignId) {
    await supabaseAdmin.from("campaign_donations").insert({
      campaign_id: campaignId,
      amount: donationAmount,
    })

    const { data: campaign } = await supabaseAdmin
      .from("tenant_campaigns")
      .select("current_amount")
      .eq("id", campaignId)
      .single()

    if (campaign) {
      await supabaseAdmin
        .from("tenant_campaigns")
        .update({
          current_amount: (campaign.current_amount || 0) + donationAmount,
        })
        .eq("id", campaignId)
    }
  }

  console.log("[v0] Invoice paid processing finished")
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[v0] Processing subscription.deleted:", subscription.id)

  const metadata = subscription.metadata || {}
  const tenantId = metadata.tenant_id

  if (!tenantId) return

  // Mark any recurring supporter as no longer recurring
  // This is optional - depends on your business logic
  console.log("[v0] Subscription cancelled for tenant:", tenantId)
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // This is a backup handler for payments not going through checkout sessions
  console.log("[v0] Payment intent succeeded:", paymentIntent.id)
  // The main processing happens in checkout.session.completed
}
