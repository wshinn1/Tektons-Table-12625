import { getTenantMenuItems } from "@/app/actions/tenant-menu"
import { getTenantPages } from "@/app/actions/tenant-pages"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { NavigationManager } from "@/components/tenant/navigation-manager"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function TenantNavigationPage({ params }: Props) {
  const { tenant: tenantSlug } = await params

  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${tenantSlug}/auth/login?redirect=/admin/navigation`)
  }

  // Get tenant and verify ownership
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain, email")
    .eq("subdomain", tenantSlug)
    .single()

  if (!tenant) {
    notFound()
  }

  // Verify ownership
  if (tenant.email !== user.email) {
    redirect(`/${tenantSlug}`)
  }

  const menuItems = await getTenantMenuItems(tenant.id)
  const pages = await getTenantPages(tenant.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Navigation</h1>
        <p className="text-muted-foreground">Manage your site&apos;s navigation menus</p>
      </div>

      <NavigationManager
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        tenantName={tenant.full_name || ""}
        initialItems={menuItems}
        pages={pages.filter((p) => p.status === "published")}
      />
    </div>
  )
}
