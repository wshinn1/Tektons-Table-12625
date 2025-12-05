import { getTenantMenuItems } from "@/app/actions/tenant-menu"
import { getTenantPages } from "@/app/actions/tenant-pages"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { MenuManager } from "@/components/tenant/menu-manager"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function TenantMenuPage({ params }: Props) {
  const { tenant: tenantSlug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, page_builder_enabled")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  if (!tenant) {
    notFound()
  }

  if (!tenant.page_builder_enabled) {
    redirect(`/${tenantSlug}/admin`)
  }

  const menuItems = await getTenantMenuItems(tenant.id)
  const pages = await getTenantPages(tenant.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">Customize your site navigation</p>
      </div>

      <MenuManager
        tenantId={tenant.id}
        tenantSlug={tenantSlug}
        initialItems={menuItems}
        pages={pages.filter((p) => p.status === "published")}
      />
    </div>
  )
}
