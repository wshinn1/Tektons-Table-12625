import { createServerClient } from "@/lib/supabase/server"
import { getPublishedPageBySlug } from "@/app/actions/tenant-pages"
import { PuckPageRender } from "@/components/tenant/puck-page-editor"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    tenant: string
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name")
    .eq("subdomain", tenantSlug)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (!tenant) {
    return { title: "Page Not Found" }
  }

  const page = await getPublishedPageBySlug(tenant.id, slug)

  if (!page) {
    return { title: "Page Not Found" }
  }

  return {
    title: `${page.title} | ${tenant.full_name}`,
    description: page.meta_description || undefined,
  }
}

export default async function CustomPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("subdomain", tenantSlug)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (!tenant) {
    notFound()
  }

  const page = await getPublishedPageBySlug(tenant.id, slug)

  if (!page) {
    notFound()
  }

  // Render using Puck if design_json exists
  if (page.design_json) {
    return (
      <div className="min-h-screen bg-background">
        <PuckPageRender data={page.design_json} tenantId={tenant.id} />
      </div>
    )
  }

  // Fallback for legacy pages with HTML content
  if (page.html_content) {
    return (
      <div className="min-h-screen">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.html_content }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">This page has no content yet.</p>
    </div>
  )
}
