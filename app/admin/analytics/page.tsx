import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin, createAdminClient } from "@/lib/supabase/admin"
import { PlatformAnalytics } from "@/components/admin/platform-analytics"

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/admin-login")
  }

  const adminClient = createAdminClient()

  // Fetch all active tenants
  const { data: tenantsData, error: tenantsError } = await adminClient
    .from("tenants")
    .select("id, subdomain, full_name")
    .eq("is_active", true)
    .order("full_name")

  if (tenantsError) {
    console.error("[AdminAnalytics] Error fetching tenants:", tenantsError)
  }

  // Fetch all subscribed email subscribers
  const { data: subscribersData, error: subscribersError } = await adminClient
    .from("tenant_email_subscribers")
    .select("tenant_id")
    .eq("status", "subscribed")

  if (subscribersError) {
    console.error("[AdminAnalytics] Error fetching subscribers:", subscribersError)
  }

  // Build a count map of tenantId → subscriber count
  const subscriberCountMap: Record<string, number> = {}
  if (subscribersData) {
    for (const row of subscribersData) {
      subscriberCountMap[row.tenant_id] = (subscriberCountMap[row.tenant_id] || 0) + 1
    }
  }

  // Combine tenants with subscriber counts
  const tenants = (tenantsData || []).map((tenant) => ({
    id: tenant.id,
    subdomain: tenant.subdomain,
    full_name: tenant.full_name,
    subscriberCount: subscriberCountMap[tenant.id] || 0,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Platform-wide analytics and insights ({tenants.length} active tenants)
        </p>
      </div>

      <PlatformAnalytics tenants={tenants} />
    </div>
  )
}
