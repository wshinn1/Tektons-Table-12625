import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { PuckPageEditor } from "@/components/tenant/puck-page-editor"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function NewPagePage({ params }: Props) {
  console.log("[v0] NEW PAGE - Server component rendering started")

  const { tenant: tenantSlug } = await params
  console.log("[v0] NEW PAGE - Tenant slug:", tenantSlug)

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, page_builder_enabled")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  console.log("[v0] NEW PAGE - Tenant data:", tenant)

  if (!tenant) {
    console.log("[v0] NEW PAGE - No tenant found, returning 404")
    notFound()
  }

  if (!tenant.page_builder_enabled) {
    console.log("[v0] NEW PAGE - Page builder disabled, redirecting")
    redirect(`/${tenantSlug}/admin`)
  }

  console.log("[v0] NEW PAGE - Rendering PuckPageEditor component")
  console.log("[v0] NEW PAGE - Props:", { tenantId: tenant.id, tenantSlug })

  return (
    <div>
      <div className="bg-green-500 text-white p-4 text-center font-bold">
        ✓ PUCK EDITOR LOADED - Deployment Working!
      </div>
      <PuckPageEditor tenantId={tenant.id} tenantSlug={tenantSlug} />
    </div>
  )
}
