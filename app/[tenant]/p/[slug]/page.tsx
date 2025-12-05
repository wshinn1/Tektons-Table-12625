import { createServerClient } from "@/lib/supabase/server"
import { getPublishedPageBySlug } from "@/app/actions/tenant-pages"
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
    title: page.meta_title || page.title,
    description: page.meta_description || undefined,
  }
}

export default async function CustomPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, page_builder_enabled")
    .eq("subdomain", tenantSlug)
    .limit(1)
    .single()

  if (!tenant || !tenant.page_builder_enabled) {
    notFound()
  }

  const page = await getPublishedPageBySlug(tenant.id, slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Render the exported HTML content */}
      <div className="unlayer-content" dangerouslySetInnerHTML={{ __html: page.html_content || "" }} />

      {/* Styles for Unlayer content */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .unlayer-content {
          width: 100%;
        }
        .unlayer-content img {
          max-width: 100%;
          height: auto;
        }
        .unlayer-content a {
          color: inherit;
        }
      `,
        }}
      />
    </div>
  )
}
