import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PageEditor } from "@/components/tenant/page-editor"
import { PlasmiPageEditor } from "@/components/tenant/plasmic-page-editor"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function NewPagePage({ params }: Props) {
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

  if (tenantSlug === "wesshinn") {
    return <PlasmiPageEditor />
  }

  return <PageEditor tenantId={tenant.id} tenantSlug={tenantSlug} />
}
