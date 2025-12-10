"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getGivingSettings(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("tenant_giving_settings").select("*").eq("tenant_id", tenantId).single()

  if (error) throw error
  return data
}

export async function updateGivingSettings(
  tenantId: string,
  settings: {
    goalAmount?: number
    goalDescription?: string
    thankYouMessage?: string
    showSupporterNames?: boolean
    suggestedAmounts?: number[]
    fee_model?: "donor_tips" | "platform_fee"
    suggested_tip_percent?: number
    fundraising_start_amount?: number
    fundraising_target_goal?: number
    show_donor_names?: boolean
    show_progress_widget?: boolean
    show_progress?: boolean
    homepage_widget_preference?: "giving" | "campaign" | "none"
  },
) {
  const supabase = createAdminClient()

  // Verify the tenant exists
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, email")
    .eq("id", tenantId)
    .single()

  if (tenantError || !tenant) {
    console.error("[v0] updateGivingSettings - Tenant not found:", tenantId)
    throw new Error("Tenant not found")
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (settings.goalAmount !== undefined) updateData.goal_amount = settings.goalAmount
  if (settings.goalDescription !== undefined) updateData.goal_description = settings.goalDescription
  if (settings.thankYouMessage !== undefined) updateData.thank_you_message = settings.thankYouMessage
  if (settings.showSupporterNames !== undefined) updateData.show_supporter_names = settings.showSupporterNames
  if (settings.suggestedAmounts !== undefined) updateData.suggested_amounts = settings.suggestedAmounts
  if (settings.fee_model !== undefined) updateData.fee_model = settings.fee_model
  if (settings.suggested_tip_percent !== undefined) updateData.suggested_tip_percent = settings.suggested_tip_percent
  if (settings.fundraising_start_amount !== undefined)
    updateData.fundraising_start_amount = settings.fundraising_start_amount
  if (settings.fundraising_target_goal !== undefined)
    updateData.fundraising_target_goal = settings.fundraising_target_goal
  if (settings.show_donor_names !== undefined) updateData.show_donor_names = settings.show_donor_names
  if (settings.show_progress_widget !== undefined) updateData.show_progress_widget = settings.show_progress_widget
  if (settings.homepage_widget_preference !== undefined) {
    updateData.homepage_widget_preference = settings.homepage_widget_preference
    updateData.show_progress_widget = settings.homepage_widget_preference === "giving"
  }
  if (settings.show_progress !== undefined) updateData.show_progress = settings.show_progress

  console.log("[v0] Updating giving settings for tenant:", tenantId)
  console.log("[v0] Update data:", JSON.stringify(updateData, null, 2))

  const { error } = await supabase.from("tenant_giving_settings").update(updateData).eq("tenant_id", tenantId)

  if (error) {
    console.error("[v0] Error updating giving settings:", error)
    throw error
  }

  console.log("[v0] Successfully updated giving settings")

  revalidatePath(`/[tenant]/admin/giving`, "page")
  revalidatePath(`/[tenant]/giving`, "page")
  revalidatePath(`/[tenant]`, "page")
  return { success: true }
}

export async function getFinancialSupporters(tenantId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.id !== tenantId) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("tenant_financial_supporters")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("total_given", { ascending: false })

  if (error) throw error
  return data
}

export async function getDonations(tenantId: string, supporterId?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.id !== tenantId) {
    throw new Error("Unauthorized")
  }

  let query = supabase
    .from("tenant_donations")
    .select("*, supporter:tenant_financial_supporters(name, email)")
    .eq("tenant_id", tenantId)
    .order("donated_at", { ascending: false })

  if (supporterId) {
    query = query.eq("supporter_id", supporterId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getGivingStats(tenantId: string) {
  const supabase = createAdminClient()

  const { count: donationCount } = await supabase
    .from("tenant_donations")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "completed")

  // Get total supporters count from tenant_financial_supporters
  const { count: totalSupporters } = await supabase
    .from("tenant_financial_supporters")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)

  // Get monthly supporters (recurring donations)
  const { count: monthlySupporters } = await supabase
    .from("tenant_financial_supporters")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gt("monthly_amount", 0)

  // Get total monthly recurring revenue from tenant_donations
  const { data: recurringDonations } = await supabase
    .from("tenant_donations")
    .select("amount")
    .eq("tenant_id", tenantId)
    .eq("status", "completed")
    .eq("type", "recurring")

  const totalMonthlyRecurring = recurringDonations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  // Get total lifetime giving from tenant_donations
  const { data: allDonations } = await supabase
    .from("tenant_donations")
    .select("amount")
    .eq("tenant_id", tenantId)
    .eq("status", "completed")

  const totalLifetimeGiving = allDonations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  return {
    totalSupporters: totalSupporters || 0,
    monthlySupporters: monthlySupporters || 0,
    totalMonthlyRecurring,
    totalLifetimeGiving,
    supportersCount: donationCount || 0,
  }
}

export async function getRecentDonors(tenantId: string, limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tenant_donations")
    .select(`
      id,
      amount,
      donated_at,
      supporter:tenant_financial_supporters(name, email)
    `)
    .eq("tenant_id", tenantId)
    .eq("status", "completed")
    .order("donated_at", { ascending: false })
    .limit(limit)

  if (error) return []

  return data.map((donation: any) => ({
    name: donation.supporter?.name || "Anonymous",
    amount: Number(donation.amount),
    timeAgo: getTimeAgo(new Date(donation.donated_at)),
  }))
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min${Math.floor(seconds / 60) > 1 ? "s" : ""}`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? "s" : ""}`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? "s" : ""}`

  return date.toLocaleDateString()
}

export async function getTotalRaised(tenantId: string): Promise<number> {
  const supabase = createAdminClient()

  console.log("[v0] getTotalRaised - Starting query for tenant:", tenantId)

  // Get starting amount from settings
  const { data: settings, error: settingsError } = await supabase
    .from("tenant_giving_settings")
    .select("fundraising_start_amount")
    .eq("tenant_id", tenantId)
    .single()

  if (settingsError) {
    console.log("[v0] getTotalRaised - Settings error (may be OK if no settings):", settingsError.message)
  }

  const startingAmount = Number(settings?.fundraising_start_amount || 0)
  console.log("[v0] getTotalRaised - Starting amount from settings:", startingAmount)

  const { data: donations, error: donationsError } = await supabase
    .from("tenant_donations")
    .select("id, amount, status, tenant_id, donated_at")
    .eq("tenant_id", tenantId)
    .eq("status", "completed")

  if (donationsError) {
    console.error("[v0] getTotalRaised - Error fetching donations:", donationsError)
    return startingAmount
  }

  console.log("[v0] getTotalRaised - Found donations count:", donations?.length || 0)

  if (donations && donations.length > 0) {
    console.log("[v0] getTotalRaised - Donation details:")
    donations.forEach((d, i) => {
      console.log(
        `[v0]   Donation ${i + 1}: id=${d.id}, amount=${d.amount}, status=${d.status}, tenant_id=${d.tenant_id}, donated_at=${d.donated_at}`,
      )
    })
  } else {
    console.log("[v0] getTotalRaised - No donations found for tenant:", tenantId)

    // Debug: Check all donations in tenant_donations table
    const { data: allDonations, error: allError } = await supabase
      .from("tenant_donations")
      .select("id, tenant_id, status, amount")
      .limit(10)

    console.log("[v0] getTotalRaised - Sample of all donations in tenant_donations table:", allDonations)
    if (allError) {
      console.error("[v0] getTotalRaised - Error fetching all donations:", allError)
    }
  }

  const donationsTotal = donations?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

  console.log("[v0] getTotalRaised - Donations total:", donationsTotal)
  console.log("[v0] getTotalRaised - Final total (start + donations):", startingAmount + donationsTotal)

  return startingAmount + donationsTotal
}
