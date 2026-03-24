import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, DollarSign, TrendingUp, HelpCircle } from "lucide-react"
import Link from "next/link"
import { emailsMatch } from "@/lib/utils"

export default async function TenantAdminDashboard({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  console.log("[v0] TenantAdminDashboard: Starting for subdomain:", subdomain)
  
  // Get session to check if cookies are being read properly
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log("[v0] TenantAdminDashboard: Session check - has session:", !!sessionData?.session, "error:", sessionError?.message)
  if (sessionData?.session) {
    console.log("[v0] TenantAdminDashboard: Session user email:", sessionData.session.user?.email)
    console.log("[v0] TenantAdminDashboard: Session expires at:", sessionData.session.expires_at)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("[v0] TenantAdminDashboard: getUser result - user:", user?.email || "not logged in", "error:", userError?.message)

  if (!user) {
    console.log("[v0] TenantAdminDashboard: No user, redirecting to login. Session existed:", !!sessionData?.session)
    redirect(`/${subdomain}/auth/login?redirect=/admin`)
  }

  // Get tenant info
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", subdomain)
    .single()

  console.log("[v0] TenantAdminDashboard: Tenant:", tenant?.email || "not found", "Error:", tenantError?.message)

  // Use case-insensitive email comparison
  const isOwner = emailsMatch(tenant?.email, user.email)
  console.log("[v0] TenantAdminDashboard: Email comparison - tenant:", tenant?.email, "user:", user.email, "match:", isOwner)
  
  if (!tenant || !isOwner) {
    console.log(
      "[v0] TenantAdminDashboard: Not owner, redirecting. Tenant email:",
      tenant?.email,
      "User email:",
      user.email,
    )
    redirect(`/${subdomain}`)
  }

  console.log("[v0] TenantAdminDashboard: Authorized, rendering dashboard")

  // Get blog stats
  const { count: postCount } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id)

  // Get follower count (placeholder for Phase 4)
  const followerCount = 0

  // Get financial stats (placeholder for Phase 6)
  const monthlyRevenue = 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Recurring donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Post views this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Start by creating your first blog post!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href={`/${subdomain}/admin/blog/create`} className="block text-sm text-blue-600 hover:underline">
              Create New Post
            </a>
            <a href={`/${subdomain}/admin/giving`} className="block text-sm text-blue-600 hover:underline">
              Set Up Giving Page
            </a>
            <a href={`/${subdomain}/admin/newsletter`} className="block text-sm text-blue-600 hover:underline">
              Send Newsletter
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link 
          href={`/${subdomain}/admin/help`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Need help?
        </Link>
      </div>
    </div>
  )
}
