import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PuckPageEditor } from "@/components/tenant/puck-page-editor"
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

  const page = await getTenantPage(pageId)

  if (!page || page.tenant_id !== tenant.id) {
    notFound()
  }

  const initialData = page.design_json || { content: [], root: { props: {} } }

  return (
    <PuckPageEditor
      pageId={pageId}
      initialData={initialData}
      tenantId={tenant.id}
      tenantSlug={tenantSlug}
      pageTitle={page.title}
      pageSlug={page.slug}
    />
  )
}
