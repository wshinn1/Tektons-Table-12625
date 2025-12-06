"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"
import { revalidatePath } from "next/cache"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function getDonorGivingHistory(tenantId: string, email: string) {
  const supabase = await createClient()

  // Get financial supporter record
  const { data: supporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("email", email)
    .single()

  if (!supporter) {
    return { donations: [], total: 0 }
  }

  // Get donation history
  const { data: donations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("supporter_id", supporter.id)
    .eq("status", "completed")
    .order("donated_at", { ascending: false })

  return {
    donations: donations || [],
    total: supporter.total_given || 0,
    monthlyAmount: supporter.monthly_amount || 0,
  }
}

export async function cancelRecurringDonation({
  tenantId,
  stripeAccountId,
  stripeCustomerId,
}: {
  tenantId: string
  stripeAccountId: string
  stripeCustomerId: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  if (!stripeAccountId || !stripeCustomerId) {
    return { error: "Missing Stripe information" }
  }

  try {
    // Get the customer's subscriptions from the connected account
    const subscriptions = await stripe.subscriptions.list(
      {
        customer: stripeCustomerId,
        status: "active",
        limit: 10,
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    if (subscriptions.data.length === 0) {
      return { error: "No active subscription found" }
    }

    // Cancel all active subscriptions
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id, {
        stripeAccount: stripeAccountId,
      })
    }

    // Update the supporter record
    const adminClient = createAdminClient()
    await adminClient
      .from("tenant_financial_supporters")
      .update({ monthly_amount: 0 })
      .eq("tenant_id", tenantId)
      .eq("email", user.email)

    revalidatePath("/donor")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error cancelling subscription:", error)
    return { error: error.message || "Failed to cancel subscription" }
  }
}

export async function updateRecurringAmount({
  tenantId,
  stripeAccountId,
  stripeCustomerId,
  newAmount,
}: {
  tenantId: string
  stripeAccountId: string
  stripeCustomerId: string
  newAmount: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  if (!stripeAccountId || !stripeCustomerId) {
    return { error: "Missing Stripe information" }
  }

  try {
    // Get the customer's active subscription
    const subscriptions = await stripe.subscriptions.list(
      {
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    if (subscriptions.data.length === 0) {
      return { error: "No active subscription found" }
    }

    const subscription = subscriptions.data[0]
    const subscriptionItem = subscription.items.data[0]

    // Create a new price for the new amount
    const newPrice = await stripe.prices.create(
      {
        unit_amount: Math.round(newAmount * 100),
        currency: "usd",
        recurring: { interval: "month" },
        product: subscriptionItem.price.product as string,
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    // Update the subscription with the new price
    await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: subscriptionItem.id,
            price: newPrice.id,
          },
        ],
        proration_behavior: "none",
      },
      {
        stripeAccount: stripeAccountId,
      },
    )

    // Update the supporter record
    const adminClient = createAdminClient()
    await adminClient
      .from("tenant_financial_supporters")
      .update({ monthly_amount: newAmount })
      .eq("tenant_id", tenantId)
      .eq("email", user.email)

    revalidatePath("/donor")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating subscription:", error)
    return { error: error.message || "Failed to update subscription" }
  }
}

export async function downloadTaxSummary({
  tenantId,
  year,
}: {
  tenantId: string
  year: number
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get financial supporter record
  const { data: supporter } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("email", user.email)
    .single()

  if (!supporter) {
    return { donations: [], total: 0 }
  }

  // Get donations for the specified year
  const { data: donations } = await supabase
    .from("tenant_donations")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("supporter_id", supporter.id)
    .eq("status", "completed")
    .gte("donated_at", `${year}-01-01`)
    .lte("donated_at", `${year}-12-31`)
    .order("donated_at", { ascending: false })

  const total = (donations || []).reduce((sum, d) => sum + (d.amount || 0), 0)

  return {
    donations: donations || [],
    total,
    year,
  }
}
