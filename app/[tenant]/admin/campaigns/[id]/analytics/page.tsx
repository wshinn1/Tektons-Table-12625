import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CampaignAnalyticsDashboard } from "@/components/tenant/campaign-analytics-dashboard"
import { emailsMatch } from "@/lib/utils"

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant: subdomain, id: campaignId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login?redirect=/admin/campaigns/${campaignId}/analytics`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant) {
    notFound()
  }

  if (!emailsMatch(tenant.email, user.email)) {
    redirect(`/${subdomain}`)
  }

  // Fetch campaign
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("tenant_id", tenant.id)
    .single()

  if (!campaign) {
    notFound()
  }

  // Fetch all campaign donations with donor info
  const { data: donations } = await supabase
    .from("campaign_donations")
    .select(`
      *,
      donation:tenant_donations!campaign_donations_donation_id_fkey (
        id,
        amount,
        is_recurring,
        created_at,
        supporter:supporters (
          id,
          full_name,
          email
        )
      )
    `)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })

  return <CampaignAnalyticsDashboard campaign={campaign} donations={donations || []} subdomain={subdomain} />
}
