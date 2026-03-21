import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SupportersManager } from "@/components/tenant/supporters-manager"

export default async function TenantSupportersManager({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login?redirect=/admin/supporters`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.email !== user.email) {
    redirect(`/${subdomain}`)
  }

  const { data: followers } = await supabase
    .from("tenant_email_subscribers")
    .select("id, name, email, subscribed_at, status")
    .eq("tenant_id", tenant.id)
    .order("subscribed_at", { ascending: false })

  const { data: financialSupporters } = await adminSupabase
    .from("supporters")
    .select("id, full_name, email, total_donated, last_donation_at")
    .eq("tenant_id", tenant.id)
    .order("total_donated", { ascending: false })

  const currentYear = new Date().getFullYear()

  const supportersWithDetails = await Promise.all(
    (financialSupporters || []).map(async (supporter) => {
      // Get YTD donations
      const { data: ytdDonations } = await adminSupabase
        .from("donations")
        .select("amount")
        .eq("tenant_id", tenant.id)
        .eq("supporter_id", supporter.id)
        .eq("status", "completed")
        .gte("created_at", `${currentYear}-01-01`)

      const ytdTotal = ytdDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

      // Get all donations with total
      const { data: allDonations } = await adminSupabase
        .from("donations")
        .select("amount")
        .eq("tenant_id", tenant.id)
        .eq("supporter_id", supporter.id)
        .eq("status", "completed")

      const lifetimeTotal = allDonations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

      const { data: recentDonation } = await adminSupabase
        .from("campaign_donations")
        .select("campaign:tenant_campaigns(title)")
        .eq("donation_id", supporter.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      const campaignName = (recentDonation as any)?.campaign?.title || null

      return {
        ...supporter,
        total_donated: lifetimeTotal,
        year_to_date: ytdTotal,
        campaign_name: campaignName,
      }
    }),
  )

  return (
    <SupportersManager tenantId={tenant.id} followers={followers || []} financialSupporters={supportersWithDetails} />
  )
}
