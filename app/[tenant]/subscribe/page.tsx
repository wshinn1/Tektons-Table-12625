import { createServerClient } from "@/lib/supabase/server"
import { SubscribeForm } from "@/components/tenant/subscribe-form"
import { headers } from "next/headers"

export default async function SubscribePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params

  const headersList = await headers()
  const tenantSubdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = tenantSubdomain === tenantSlug

  const supabase = await createServerClient()
  const { data: tenant } = await supabase.from("tenants").select("id, full_name").eq("subdomain", tenantSlug).single()

  let subscriberCount = 0
  let recentPostsCount = 0
  let groups: Array<{ id: string; name: string; description: string | null }> = []

  if (tenant) {
    const { count } = await supabase
      .from("supporter_profiles")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("email_notifications", true)

    subscriberCount = count || 0

    const { count: postsCount } = await supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("status", "published")

    recentPostsCount = postsCount || 0

    const { data: groupsData } = await supabase
      .from("subscriber_groups")
      .select("id, name, description")
      .eq("tenant_id", tenant.id)
      .order("name")

    groups = groupsData || []
  }

  return (
    <SubscribeForm
      tenantSlug={tenantSlug}
      tenantName={tenant?.full_name || tenantSlug}
      subscriberCount={subscriberCount}
      recentPostsCount={recentPostsCount}
      isSubdomain={isSubdomain}
      groups={groups}
    />
  )
}
