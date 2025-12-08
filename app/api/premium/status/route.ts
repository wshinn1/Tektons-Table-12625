import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        hasAccess: false,
        status: "not_logged_in",
        subscription: null,
        compedAccess: null,
      })
    }

    const supabaseAdmin = createAdminClient()

    // Check subscription status
    const { data: subscription } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Check comped access
    const { data: compedAccess } = await supabaseAdmin
      .from("comped_access")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .single()

    // Determine access status
    let hasAccess = false
    let accessReason = "none"

    // Check subscription
    if (subscription) {
      const now = new Date()
      const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null
      const graceEnd = subscription.grace_period_end ? new Date(subscription.grace_period_end) : null

      if (subscription.status === "active" || subscription.status === "trialing") {
        hasAccess = true
        accessReason = subscription.status === "trialing" ? "trial" : "subscription"
      } else if (subscription.status === "canceled" && periodEnd && periodEnd > now) {
        hasAccess = true
        accessReason = "canceled_active"
      } else if (subscription.status === "past_due" && graceEnd && graceEnd > now) {
        hasAccess = true
        accessReason = "grace_period"
      }
    }

    // Check comped access (overrides subscription if active)
    if (compedAccess) {
      hasAccess = true
      accessReason = "comped"
    }

    return NextResponse.json({
      hasAccess,
      accessReason,
      subscription: subscription
        ? {
            status: subscription.status,
            isTenantTrial: subscription.is_tenant_trial,
            trialEndDate: subscription.trial_end_date,
            currentPeriodEnd: subscription.current_period_end,
            gracePeriodEnd: subscription.grace_period_end,
            canceledAt: subscription.canceled_at,
          }
        : null,
      compedAccess: compedAccess
        ? {
            reason: compedAccess.reason,
            expiresAt: compedAccess.expires_at,
          }
        : null,
    })
  } catch (error: any) {
    console.error("[v0] Error checking premium status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
