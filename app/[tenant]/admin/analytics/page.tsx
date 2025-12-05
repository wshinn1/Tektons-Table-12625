import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MessageCircle, TrendingUp } from "lucide-react"

export default async function TenantBlogAnalytics({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.email !== user.email) {
    redirect(`/${subdomain}`)
  }

  const { data: blogPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, views, published_at, status")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(10)

  const totalViews = blogPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
  const publishedCount = blogPosts?.length || 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog Analytics</h1>
        <p className="text-muted-foreground mt-2">Track post performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views/Post</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Your most viewed blog posts</CardDescription>
        </CardHeader>
        <CardContent>
          {blogPosts && blogPosts.length > 0 ? (
            <div className="space-y-4">
              {blogPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Not published"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">{post.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No published blog posts yet. Create and publish posts to track their performance.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
