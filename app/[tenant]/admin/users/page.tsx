import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FollowerManagement } from "@/components/tenant/follower-management"

export default async function TenantUserManagement({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login?redirect=/admin/users`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.id !== user.id) {
    redirect(`/${subdomain}`)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Approve followers and manage user permissions.</p>
      </div>

      <FollowerManagement tenantId={tenant.id} tenantSlug={subdomain} />
    </div>
  )
}
