import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PageEditor } from "@/components/tenant/page-editor"
import { GrapesJSPageEditor } from "@/components/tenant/grapesjs-page-editor"
import Script from "next/script"

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
    .select("id, page_builder_enabled, page_builder_type")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  if (!tenant) {
    notFound()
  }

  if (!tenant.page_builder_enabled) {
    redirect(`/${tenantSlug}/admin`)
  }

  if (tenant.page_builder_type === "grapesjs") {
    return (
      <>
        <Script src="https://unpkg.com/grapesjs" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/grapesjs-blocks-basic" strategy="beforeInteractive" />
        <GrapesJSPageEditor tenantId={tenant.id} tenantSlug={tenantSlug} />
      </>
    )
  }

  return <PageEditor tenantId={tenant.id} tenantSlug={tenantSlug} />
}
