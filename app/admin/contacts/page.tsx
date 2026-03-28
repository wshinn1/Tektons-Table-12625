import { isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { ContactsManager } from "@/components/admin/crm/contacts-manager"
import { TenantContactsManager } from "@/components/admin/crm/tenant-contacts-manager"
import { ContactsPageHeader } from "@/components/admin/crm/contacts-page-header"

export default async function ContactsPage() {
  if (!(await isSuperAdmin())) {
    redirect("/admin")
  }

  const supabase = createAdminClient()

  // Fetch all active tenants
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, subdomain, full_name")
    .eq("status", "active")
    .order("full_name")

  // Fetch counts in parallel
  const [subscribersResult, supportersResult, followersResult] = await Promise.all([
    supabase
      .from("tenant_email_subscribers")
      .select("tenant_id")
      .eq("status", "subscribed"),
    supabase
      .from("tenant_financial_supporters")
      .select("tenant_id"),
    supabase
      .from("tenant_followers")
      .select("tenant_id"),
  ])

  // Build count maps
  const subscriberCounts = new Map<string, number>()
  const supporterCounts = new Map<string, number>()
  const followerCounts = new Map<string, number>()

  for (const row of subscribersResult.data || []) {
    subscriberCounts.set(row.tenant_id, (subscriberCounts.get(row.tenant_id) || 0) + 1)
  }

  for (const row of supportersResult.data || []) {
    supporterCounts.set(row.tenant_id, (supporterCounts.get(row.tenant_id) || 0) + 1)
  }

  for (const row of followersResult.data || []) {
    followerCounts.set(row.tenant_id, (followerCounts.get(row.tenant_id) || 0) + 1)
  }

  // Merge counts into tenant list
  const tenantsWithCounts = (tenants || []).map((tenant) => ({
    ...tenant,
    subscriberCount: subscriberCounts.get(tenant.id) || 0,
    supporterCount: supporterCounts.get(tenant.id) || 0,
    followerCount: followerCounts.get(tenant.id) || 0,
  }))

  return (
    <div className="p-8">
      <ContactsPageHeader />

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Contacts by Tenant Site</h2>
          <TenantContactsManager tenants={tenantsWithCounts} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Platform Contacts</h2>
          <ContactsManager />
        </section>
      </div>
    </div>
  )
}
