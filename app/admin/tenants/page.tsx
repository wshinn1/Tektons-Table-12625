import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TenantCard } from "@/components/admin/tenants/tenant-card"

export const dynamic = "force-dynamic"

export default async function TenantsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const { data: tenants } = await supabase.from("tenants").select("*").order("created_at", { ascending: false })

  // Fetch donation stats separately for each tenant
  const tenantsWithStats = await Promise.all(
    (tenants || []).map(async (tenant) => {
      const { data: donations } = await supabase.from("donations").select("amount").eq("tenant_id", tenant.id)

      const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
      const donationCount = donations?.length || 0

      return {
        tenant_id: tenant.id,
        subdomain: tenant.subdomain,
        full_name: tenant.full_name,
        total_donations: totalDonations,
        donation_count: donationCount,
        donations_last_30_days: 0,
        is_active: tenant.is_active ?? true,
        ...tenant,
      }
    }),
  )

  const activeTenants = tenantsWithStats.filter((t) => t.is_active)
  const inactiveTenants = tenantsWithStats.filter((t) => !t.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Manage all missionary and nonprofit accounts</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            {activeTenants.length} Active
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {tenantsWithStats.length} Total
          </Badge>
        </div>
      </div>

      {/* Active Tenants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Tenants</h2>
        <div className="grid gap-4">
          {activeTenants.map((tenant) => (
            <TenantCard key={tenant.tenant_id} tenant={tenant} />
          ))}
          {activeTenants.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No active tenants</p>
            </Card>
          )}
        </div>
      </div>

      {/* Inactive Tenants */}
      {inactiveTenants.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Inactive Tenants</h2>
          <div className="grid gap-4">
            {inactiveTenants.map((tenant) => (
              <TenantCard key={tenant.tenant_id} tenant={tenant} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
