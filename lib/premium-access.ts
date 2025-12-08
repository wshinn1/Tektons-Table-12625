import { createClient } from "@/lib/supabase/server"

export type PremiumAccessStatus = {
  hasAccess: boolean
  accessType: "subscription" | "trial" | "comped" | "grace_period" | "none"
  expiresAt: Date | null
  daysRemaining: number | null
  subscription?: {
    status: string
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: Date | null
  }
  comped?: {
    reason: string | null
    grantedAt: Date
  }
}

export async function checkPremiumAccess(userId: string): Promise<PremiumAccessStatus> {
  const supabase = await createClient()

  // Default response - no access
  const noAccess: PremiumAccessStatus = {
    hasAccess: false,
    accessType: "none",
    expiresAt: null,
    daysRemaining: null,
  }

  if (!userId) {
    return noAccess
  }

  // Check 1: Active subscription
  const { data: subscription } = await supabase.from("premium_subscriptions").select("*").eq("user_id", userId).single()

  if (subscription) {
    const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null

    // Active or trialing subscription
    if (["active", "trialing"].includes(subscription.status)) {
      const daysRemaining = currentPeriodEnd
        ? Math.ceil((currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null

      return {
        hasAccess: true,
        accessType: subscription.status === "trialing" ? "trial" : "subscription",
        expiresAt: currentPeriodEnd,
        daysRemaining,
        subscription: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.canceled_at !== null,
          currentPeriodEnd,
        },
      }
    }

    // Canceled but still in period
    if (subscription.status === "canceled" && currentPeriodEnd && currentPeriodEnd > new Date()) {
      const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      return {
        hasAccess: true,
        accessType: "subscription",
        expiresAt: currentPeriodEnd,
        daysRemaining,
        subscription: {
          status: "canceled",
          cancelAtPeriodEnd: true,
          currentPeriodEnd,
        },
      }
    }

    // Past due with grace period
    if (subscription.status === "past_due" && subscription.grace_period_end) {
      const gracePeriodEnd = new Date(subscription.grace_period_end)
      if (gracePeriodEnd > new Date()) {
        const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

        return {
          hasAccess: true,
          accessType: "grace_period",
          expiresAt: gracePeriodEnd,
          daysRemaining,
          subscription: {
            status: "past_due",
            cancelAtPeriodEnd: false,
            currentPeriodEnd,
          },
        }
      }
    }
  }

  // Check 2: Comped access
  const { data: compedAccess } = await supabase
    .from("comped_access")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (compedAccess) {
    const expiresAt = compedAccess.expires_at ? new Date(compedAccess.expires_at) : null
    const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

    return {
      hasAccess: true,
      accessType: "comped",
      expiresAt,
      daysRemaining,
      comped: {
        reason: compedAccess.reason,
        grantedAt: new Date(compedAccess.created_at),
      },
    }
  }

  return noAccess
}

// Quick check function for middleware/API routes
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const status = await checkPremiumAccess(userId)
  return status.hasAccess
}
