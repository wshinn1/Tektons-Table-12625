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
    const { count: emailSubscriberCount } = await supabase
      .from("tenant_email_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("status", "active")

    // Also count approved followers
    const { count: followerCount } = await supabase
      .from("tenant_followers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("status", "approved")

    // Use the higher of the two counts, or sum them if they track different things
    subscriberCount = Math.max(emailSubscriberCount || 0, followerCount || 0)

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
