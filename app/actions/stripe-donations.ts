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
    // Virtual tier for custom donations
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
    // Standard tier from predefined tiers
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

  // Get tenant info for connected Stripe account
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
    .select("fee_model")
    .eq("tenant_id", tenantId)
    .single()

  const feeModel = givingSettings?.fee_model || "donor_tips"
  console.log("[v0] Fee model:", feeModel)

  const tipInCents = Math.round(tipAmount * 100)
  const donationAmountInCents = tier.amountInCents
  const totalAmountInCents = donationAmountInCents + tipInCents

  console.log(
    "[v0] Amounts - Donation:",
    donationAmountInCents,
    "cents, Tip:",
    tipInCents,
    "cents, Total:",
    totalAmountInCents,
    "cents",
  )

  let platformFeePercentage = 0
  let applicationFeeAmount = 0 // For one-time payments
  let applicationFeePercent = 0 // For subscriptions

  if (feeModel === "platform_fee") {
    const { data: platformFeeConfig } = await supabase
      .from("platform_fee_config")
      .select("base_fee_percentage")
      .order("effective_date", { ascending: false })
      .limit(1)
      .single()

    platformFeePercentage = platformFeeConfig?.base_fee_percentage || 3.5

    // Calculate application fee based on donation amount
    if (tier.recurring) {
      applicationFeePercent = platformFeePercentage
    } else {
      applicationFeeAmount = Math.round((tier.amountInCents * platformFeePercentage) / 100)
    }
  } else if (feeModel === "donor_tips" && tipInCents > 0) {
    // The application_fee_percent is applied to the TOTAL subscription amount (all line items)
    // So we need to calculate what percentage of the total equals the tip amount

    if (tier.recurring) {
      // For recurring subscriptions:
      // application_fee_percent is applied to the total of ALL line items
      // Total = donation + tip, and we want the fee to equal the tip
      // So: applicationFeePercent = (tipInCents / totalAmountInCents) * 100
      applicationFeePercent = Math.round((tipInCents / totalAmountInCents) * 100 * 100) / 100
      console.log(
        "[v0] Recurring subscription - applicationFeePercent:",
        applicationFeePercent,
        "% of total",
        totalAmountInCents,
        "cents =",
        Math.round((totalAmountInCents * applicationFeePercent) / 100),
        "cents",
      )
    } else {
      // For one-time payments, the application_fee_amount is a fixed amount
      applicationFeeAmount = tipInCents
      console.log("[v0] One-time payment - applicationFeeAmount:", applicationFeeAmount, "cents")
    }
  }

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

  if (tipInCents > 0) {
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
  console.log("[v0] Total line items amount:", totalLineItemsAmount, "cents (should equal", totalAmountInCents, ")")

  const sessionParams: any = {
    mode: tier.recurring ? "subscription" : "payment",
    success_url: campaignSlug
      ? `https://${tenant.subdomain}.tektonstable.com/campaigns/${campaignSlug}/success?session_id={CHECKOUT_SESSION_ID}`
      : `https://${tenant.subdomain}.tektonstable.com/giving/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: campaignSlug
      ? `https://${tenant.subdomain}.tektonstable.com/campaigns/${campaignSlug}`
      : `https://${tenant.subdomain}.tektonstable.com/giving`,
    customer_email: donorEmail,
    line_items: lineItems,
    payment_method_types: ["card", "us_bank_account", "sepa_debit", "ideal", "bancontact"],
    payment_method_options: {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    },
    metadata: {
      tenant_id: tenantId,
      tier_id: tierId,
      fee_model: feeModel,
      donation_amount: donationAmountInCents / 100,
      tip_amount: tipInCents / 100,
      total_amount: totalAmountInCents / 100,
      authenticated_user_id: user?.id || "",
      campaign_id: campaignId || "",
      campaign_name: campaign?.title || "",
    },
    payment_intent_data: tier.recurring
      ? undefined
      : {
          metadata: {
            tenant_id: tenantId,
            tier_id: tierId,
            fee_model: feeModel,
            donation_amount: donationAmountInCents / 100,
            tip_amount: tipInCents / 100,
            total_amount: totalAmountInCents / 100,
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
            fee_model: feeModel,
            donation_amount: donationAmountInCents / 100,
            tip_amount: tipInCents / 100,
            total_amount: totalAmountInCents / 100,
            authenticated_user_id: user?.id || "",
            campaign_id: campaignId || "",
            campaign_name: campaign?.title || "",
          },
        }
      : undefined,
  }

  if (tenant.stripe_account_id) {
    console.log("[v0] Using Stripe Connect account")

    if (tier.recurring) {
      if (applicationFeePercent > 0) {
        sessionParams.subscription_data = {
          ...sessionParams.subscription_data,
          application_fee_percent: applicationFeePercent,
        }
        console.log(
          "[v0] Setting subscription application_fee_percent:",
          applicationFeePercent,
          "% (will collect",
          Math.round((totalAmountInCents * applicationFeePercent) / 100),
          "cents from",
          totalAmountInCents,
          "total)",
        )
      }
    } else {
      // For one-time payments, use application_fee_amount
      if (applicationFeeAmount > 0) {
        sessionParams.payment_intent_data = {
          ...sessionParams.payment_intent_data,
          application_fee_amount: applicationFeeAmount,
        }
        console.log("[v0] Setting payment application_fee_amount:", applicationFeeAmount, "cents")
      }
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
      // Remove stripe_account from sessionParams (if it exists from previous code)
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
