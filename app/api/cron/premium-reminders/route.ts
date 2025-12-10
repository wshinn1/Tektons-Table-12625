import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  sendTrialEndingEmail,
  sendCompExpiringEmail,
  sendPaymentReminderEmail,
  sendUpcomingRenewalEmail, // Import new email function
} from "@/lib/premium-emails"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient()
  const results = {
    trialReminders: 0,
    compReminders: 0,
    paymentReminders: 0,
    renewalReminders: 0, // Add renewal counter
    errors: [] as string[],
  }

  try {
    // 1. Send trial ending reminders (7 days before)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const sixDaysFromNow = new Date()
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6)

    const { data: trialingSubs } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("user_id, trial_end_date, is_tenant_trial")
      .eq("status", "trialing")
      .gte("trial_end_date", sixDaysFromNow.toISOString())
      .lte("trial_end_date", sevenDaysFromNow.toISOString())

    for (const sub of trialingSubs || []) {
      try {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(sub.user_id)
        if (user?.user?.email) {
          await sendTrialEndingEmail(user.user.email, new Date(sub.trial_end_date), sub.is_tenant_trial || false)
          results.trialReminders++
        }
      } catch (err) {
        results.errors.push(`Trial reminder failed for ${sub.user_id}: ${err}`)
      }
    }

    // 2. Send comp access expiring reminders (7 days before)
    const { data: expiringComps } = await supabaseAdmin
      .from("comped_access")
      .select("user_id, expires_at")
      .eq("is_active", true)
      .not("expires_at", "is", null)
      .gte("expires_at", sixDaysFromNow.toISOString())
      .lte("expires_at", sevenDaysFromNow.toISOString())

    for (const comp of expiringComps || []) {
      try {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(comp.user_id)
        if (user?.user?.email) {
          await sendCompExpiringEmail(user.user.email, new Date(comp.expires_at))
          results.compReminders++
        }
      } catch (err) {
        results.errors.push(`Comp reminder failed for ${comp.user_id}: ${err}`)
      }
    }

    // 3. Send payment reminder for past_due subscriptions (3 days after failure)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const fourDaysAgo = new Date()
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

    const { data: pastDueSubs } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("user_id, grace_period_start, grace_period_end")
      .eq("status", "past_due")
      .gte("grace_period_start", fourDaysAgo.toISOString())
      .lte("grace_period_start", threeDaysAgo.toISOString())

    for (const sub of pastDueSubs || []) {
      try {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(sub.user_id)
        if (user?.user?.email && sub.grace_period_end) {
          await sendPaymentReminderEmail(user.user.email, new Date(sub.grace_period_end))
          results.paymentReminders++
        }
      } catch (err) {
        results.errors.push(`Payment reminder failed for ${sub.user_id}: ${err}`)
      }
    }

    const { data: renewingSubs } = await supabaseAdmin
      .from("premium_subscriptions")
      .select("user_id, current_period_end")
      .eq("status", "active")
      .gte("current_period_end", sixDaysFromNow.toISOString())
      .lte("current_period_end", sevenDaysFromNow.toISOString())

    for (const sub of renewingSubs || []) {
      try {
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(sub.user_id)
        if (user?.user?.email) {
          await sendUpcomingRenewalEmail(user.user.email, new Date(sub.current_period_end))
          results.renewalReminders++
        }
      } catch (err) {
        results.errors.push(`Renewal reminder failed for ${sub.user_id}: ${err}`)
      }
    }

    console.log("[v0] Premium reminders cron completed:", results)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error("[v0] Premium reminders cron error:", error)
    return NextResponse.json({ error: "Failed to process reminders", details: error }, { status: 500 })
  }
}
