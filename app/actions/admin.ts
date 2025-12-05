"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getTenantsList() {
  const supabase = await createServerClient()

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(`
      id,
      subdomain,
      full_name,
      email,
      mission_organization,
      location,
      platform_fee_percentage,
      is_active,
      created_at,
      onboarding_completed
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return tenants
}

export async function getTenantDetails(tenantId: string) {
  const adminClient = createAdminClient()

  const { data: tenant, error } = await adminClient
    .from("tenants")
    .select(`
      *,
      supporters:supporters(count),
      posts:posts(count),
      donations:donations(amount, created_at)
    `)
    .eq("id", tenantId)
    .single()

  if (error) throw error
  return tenant
}

export async function updateTenantStatus(tenantId: string, isActive: boolean) {
  const adminClient = createAdminClient()

  const { error } = await adminClient.from("tenants").update({ is_active: isActive }).eq("id", tenantId)

  if (error) throw error
  revalidatePath("/admin/tenants")
}

export async function deleteTenant(tenantId: string) {
  const adminClient = createAdminClient()

  // Delete tenant (cascade will handle related records)
  const { error } = await adminClient.from("tenants").delete().eq("id", tenantId)

  if (error) throw error
  revalidatePath("/admin/tenants")
}

export async function getPlatformAnalytics() {
  const adminClient = createAdminClient()

  // Get total tenants
  const { count: totalTenants } = await adminClient.from("tenants").select("*", { count: "exact", head: true })

  // Get active tenants (made a donation in last 30 days)
  const { count: activeTenants } = await adminClient
    .from("tenants")
    .select("id")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { data: donationStats } = await adminClient
    .from("donations")
    .select("amount, platform_fee, tip_amount, stripe_fee, supporter_covered_stripe_fee")

  const totalDonations = donationStats?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  const platformFees = donationStats?.reduce((sum, d) => sum + (d.platform_fee || 0), 0) || 0
  const tips = donationStats?.reduce((sum, d) => sum + (d.tip_amount || 0), 0) || 0
  const feeCoverage =
    donationStats?.reduce((sum, d) => {
      return sum + (d.supporter_covered_stripe_fee ? d.stripe_fee || 0 : 0)
    }, 0) || 0

  return {
    totalTenants: totalTenants || 0,
    activeTenants: activeTenants || 0,
    totalDonations: totalDonations / 100, // Convert cents to dollars
    platformFees: platformFees / 100,
    tips: tips / 100,
    feeCoverage: feeCoverage / 100,
    totalRevenue: (platformFees + tips + feeCoverage) / 100,
  }
}

export async function updatePlatformFee(newFeePercentage: number) {
  const adminClient = createAdminClient()

  const { error } = await adminClient.from("platform_settings").upsert({
    setting_key: "base_platform_fee_percentage",
    setting_value: newFeePercentage.toString(),
  })

  if (error) throw error
  revalidatePath("/admin/settings")
}
