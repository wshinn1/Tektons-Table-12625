"use server"

import { stripe } from "@/lib/stripe"
import { DEFAULT_DONATION_TIERS } from "@/lib/donation-tiers"
import { createServerClient } from "@/lib/supabase/server"

interface CustomTierData {
  amount: number
  type: "monthly" | "once"
}

function parseCustomTierId(tierId: string): CustomTierData | null {
  const match = tierId.match(/^custom-(monthly|once)-(\d+(?:\.\d+)?)$/)
  if (!match) return null

  return {
    amount: Number.parseFloat(match[2]),
    type: match[1] as "monthly" | "once",
  }
}

const PLATFORM_FEE_PERCENTAGE = 3.5

export async function startDonationCheckout(
  tenantId: string,
  tierId: string,
  donorEmail?: string,
  tipAmount = 0,
  campaignId?: string,
) {
  console.log(
    "[v0] Starting donation checkout with tierId:",
    tierId,
    "tipAmount:",
    tipAmount,
    "campaignId:",
    campaignId,
  )

  const customTier = parseCustomTierId(tierId)
  let tier
  let isCustom = false

  if (customTier) {
    isCustom = true
    const isRecurring = customTier.type === "monthly"
    tier = {
      id: tierId,
      name: `Custom ${isRecurring ? "Monthly" : "One-Time"} Donation`,
      amountInCents: Math.round(customTier.amount * 100),
      recurring: isRecurring,
      description: `Your ${isRecurring ? "monthly" : "one-time"} contribution`,
      icon: "heart" as const,
    }
    console.log("[v0] Created custom tier:", tier)
  } else {
    tier = DEFAULT_DONATION_TIERS.find((t) => t.id === tierId)
    if (!tier) {
      throw new Error(`Donation tier with id "${tierId}" not found`)
    }
  }

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Authenticated user ID:", user?.id || "none")

  const { data: tenant } = await supabase.from("tenants").select("*").eq("id", tenantId).single()

  if (!tenant) {
    throw new Error("Tenant not found")
  }

  console.log("[v0] Tenant Stripe account ID:", tenant.stripe_account_id)

  let campaign = null
  let campaignSlug = null
  if (campaignId) {
    const { data: campaignData } = await supabase
      .from("tenant_campaigns")
      .select("title, slug")
      .eq("id", campaignId)
      .single()

    campaign = campaignData
    campaignSlug = campaignData?.slug
    console.log("[v0] Campaign found:", campaign?.title, "slug:", campaignSlug)
  }

  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("fee_model, allow_donor_tips")
    .eq("tenant_id", tenantId)
    .single()

  const allowDonorTips = givingSettings?.allow_donor_tips || false
  console.log("[v0] Allow donor tips:", allowDonorTips)

  const tipInCents = Math.round(tipAmount * 100)
  const donationAmountInCents = tier.amountInCents

  const platformFeeInCents = Math.round((donationAmountInCents * PLATFORM_FEE_PERCENTAGE) / 100)

  const totalApplicationFeeInCents = platformFeeInCents + tipInCents

  // Total charged to donor = donation + tip (platform fee comes out of donation)
  const totalAmountInCents = donationAmountInCents + tipInCents

  console.log(
    "[v0] Amounts - Donation:",
    donationAmountInCents,
    "cents, Platform Fee (3.5%):",
    platformFeeInCents,
    "cents, Tip:",
    tipInCents,
    "cents, Total App Fee:",
    totalApplicationFeeInCents,
    "cents, Total Charged:",
    totalAmountInCents,
    "cents",
  )

  const lineItems: any[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: tier.name,
          description: tier.description,
        },
        unit_amount: tier.amountInCents,
        recurring: tier.recurring
          ? {
              interval: "month",
            }
          : undefined,
      },
      quantity: 1,
    },
  ]

  if (allowDonorTips && tipInCents > 0) {
    console.log("[v0] Adding tip line item:", tipInCents, "cents")
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Platform Support Tip",
          description: "Optional tip to support platform operations",
        },
        unit_amount: tipInCents,
        recurring: tier.recurring
          ? {
              interval: "month",
            }
          : undefined,
      },
      quantity: 1,
    })
  }

  const totalLineItemsAmount = lineItems.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0)
  console.log("[v0] Total line items amount:", totalLineItemsAmount, "cents")

  const sessionParams: any = {
    mode: tier.recurring ? "subscription" : "payment",
    payment_method_types: ["card"],
    success_url: campaignSlug
      ? `https://${tenant.subdomain}.tektonstable.com/campaigns/${campaignSlug}/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${tenant.subdomain}.tektonstable.com/giving/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: campaignSlug
      ? `https://${tenant.subdomain}.tektonstable.com/campaigns/${campaignSlug}`
      : `https://${tenant.subdomain}.tektonstable.com/giving`,
    customer_email: donorEmail,
    line_items: lineItems,
    metadata: {
      tenant_id: tenantId,
      tier_id: tierId,
      donation_amount: donationAmountInCents / 100,
      platform_fee: platformFeeInCents / 100,
      tip_amount: tipInCents / 100,
      total_amount: totalLineItemsAmount / 100,
      authenticated_user_id: user?.id || "",
      campaign_id: campaignId || "",
      campaign_name: campaign?.title || "",
    },
    payment_intent_data: tier.recurring
      ? undefined
      : {
          receipt_email: donorEmail,
          metadata: {
            tenant_id: tenantId,
            tier_id: tierId,
            donation_amount: donationAmountInCents / 100,
            platform_fee: platformFeeInCents / 100,
            tip_amount: tipInCents / 100,
            total_amount: totalLineItemsAmount / 100,
            authenticated_user_id: user?.id || "",
            campaign_id: campaignId || "",
            campaign_name: campaign?.title || "",
          },
        },
    subscription_data: tier.recurring
      ? {
          metadata: {
            tenant_id: tenantId,
            tier_id: tierId,
            donation_amount: donationAmountInCents / 100,
            platform_fee: platformFeeInCents / 100,
            tip_amount: tipInCents / 100,
            total_amount: totalLineItemsAmount / 100,
            authenticated_user_id: user?.id || "",
            campaign_id: campaignId || "",
            campaign_name: campaign?.title || "",
          },
          invoice_settings: {
            // Stripe will send invoice emails for subscriptions
          },
        }
      : undefined,
  }

  if (tenant.stripe_account_id) {
    console.log("[v0] Using Stripe Connect account")

    if (tier.recurring) {
      // For subscriptions, calculate the percentage that equals our total fee
      // application_fee_percent applies to the total of all line items
      const applicationFeePercent = Math.round((totalApplicationFeeInCents / totalLineItemsAmount) * 100 * 100) / 100

      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        application_fee_percent: applicationFeePercent,
      }
      console.log(
        "[v0] Setting subscription application_fee_percent:",
        applicationFeePercent,
        "% (will collect",
        Math.round((totalLineItemsAmount * applicationFeePercent) / 100),
        "cents from",
        totalLineItemsAmount,
        "total)",
      )
    } else {
      // For one-time payments, use fixed application_fee_amount
      sessionParams.payment_intent_data = {
        ...sessionParams.payment_intent_data,
        application_fee_amount: totalApplicationFeeInCents,
      }
      console.log("[v0] Setting payment application_fee_amount:", totalApplicationFeeInCents, "cents")
    }
  } else {
    console.error("[v0] Tenant has no Stripe account connected")
    throw new Error(
      "This missionary hasn't connected their Stripe account yet. Please contact them to set up donations.",
    )
  }

  console.log("[v0] Creating Stripe checkout session with params:", JSON.stringify(sessionParams, null, 2))

  try {
    let session
    if (tenant.stripe_account_id) {
      console.log("[v0] Creating session on connected account:", tenant.stripe_account_id)
      const { stripe_account, ...cleanParams } = sessionParams

      session = await stripe.checkout.sessions.create(cleanParams, {
        stripeAccount: tenant.stripe_account_id,
      })
    } else {
      console.error("[v0] Tenant has no Stripe account connected")
      throw new Error(
        "This missionary hasn't connected their Stripe account yet. Please contact them to set up donations.",
      )
    }

    console.log("[v0] Checkout session created successfully, URL:", session.url)
    return session.url
  } catch (error) {
    console.error("[v0] Error creating Stripe checkout session:", error)
    throw error
  }
}
