import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { emailsMatch } from "@/lib/utils"
import { BlogViewLayoutSettings } from "@/components/tenant/admin/blog-view-layout-settings"

export default async function BlogViewPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenantSlug}`)
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, email, subdomain, blog_view_layout")
    .eq("subdomain", tenantSlug)
    .single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${tenantSlug}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog View</h1>
        <p className="text-muted-foreground">
          Choose how your blog posts are displayed to visitors
        </p>
      </div>

      <div className="space-y-8">
        <BlogViewLayoutSettings
          tenantId={tenant.id}
          currentLayout={tenant.blog_view_layout || "grid"}
        />
      </div>
    </div>
  )
}
