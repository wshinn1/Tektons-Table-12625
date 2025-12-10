import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PageEditor } from "@/components/tenant/page-editor"
import { GrapesJSPageEditor } from "@/components/tenant/grapesjs-page-editor"
import { getTenantPage } from "@/app/actions/tenant-pages"

interface Props {
  params: Promise<{
    tenant: string
    id: string
  }>
}

export default async function EditPagePage({ params }: Props) {
  const { tenant: tenantSlug, id: pageId } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, page_builder_enabled, page_builder_type")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  if (!tenant) {
    notFound()
  }

  if (!tenant.page_builder_enabled) {
    redirect(`/admin`)
  }

  const page = await getTenantPage(pageId)

  if (!page || page.tenant_id !== tenant.id) {
    notFound()
  }

  if (tenant.page_builder_type === "grapesjs") {
    return <GrapesJSPageEditor tenantId={tenant.id} tenantSlug={tenantSlug} page={page} />
  }

  return <PageEditor tenantId={tenant.id} subdomain={tenantSlug} page={page} />
}
