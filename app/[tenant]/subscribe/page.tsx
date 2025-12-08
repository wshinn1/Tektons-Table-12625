import { createServerClient } from "@/lib/supabase/server"
import { SubscribeForm } from "@/components/tenant/subscribe-form"
import { headers } from "next/headers"

export default async function SubscribePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params

  const headersList = await headers()
  const tenantSubdomain = headersList.get("x-tenant-subdomain") || ""
  const isSubdomain = tenantSubdomain === tenantSlug

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: tenant } = await supabase.from("tenants").select("id, full_name").eq("subdomain", tenantSlug).single()

  let subscriberCount = 0
  let recentPostsCount = 0
  let groups: Array<{ id: string; name: string; description: string | null }> = []
  let isAlreadyFollowing = false
  const currentUserEmail = user?.email || null
  let currentUserName = ""

  if (tenant) {
    const { count: emailSubscriberCount } = await supabase
      .from("tenant_email_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .in("status", ["active", "subscribed"])

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

    if (user) {
      // Check tenant_followers
      const { data: existingFollower } = await supabase
        .from("tenant_followers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("user_id", user.id)
        .single()

      // Check tenant_email_subscribers
      const { data: existingSubscriber } = await supabase
        .from("tenant_email_subscribers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("email", user.email)
        .single()

      isAlreadyFollowing = !!(existingFollower || existingSubscriber)

      // Get user's name from supporter_profiles or user metadata
      const { data: profile } = await supabase.from("supporter_profiles").select("full_name").eq("id", user.id).single()

      currentUserName = profile?.full_name || user.user_metadata?.full_name || ""
    }
  }

  return (
    <SubscribeForm
      tenantSlug={tenantSlug}
      tenantName={tenant?.full_name || tenantSlug}
      tenantId={tenant?.id || ""}
      subscriberCount={subscriberCount}
      recentPostsCount={recentPostsCount}
      isSubdomain={isSubdomain}
      groups={groups}
      isLoggedIn={!!user}
      isAlreadyFollowing={isAlreadyFollowing}
      currentUserEmail={currentUserEmail}
      currentUserName={currentUserName}
    />
  )
}
