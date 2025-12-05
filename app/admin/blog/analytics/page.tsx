import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { getBlogAnalytics } from "@/app/actions/blog"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Eye, ThumbsUp, MessageCircle, FileText, FilePen } from "lucide-react"

export default async function BlogAnalyticsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const analytics = await getBlogAnalytics()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blog Analytics</h1>
        <p className="text-gray-500 mt-1">Track blog performance and engagement metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Views</div>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Claps</div>
              <div className="text-2xl font-bold">{analytics.totalClaps.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Comments</div>
              <div className="text-2xl font-bold">{analytics.totalComments.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Published Posts</div>
              <div className="text-2xl font-bold">{analytics.totalPosts}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FilePen className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Draft Posts</div>
              <div className="text-2xl font-bold">{analytics.draftPosts}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Performing Posts</h2>
        <div className="space-y-4">
          {analytics.topPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">Published {new Date(post.published_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.claps_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent Posts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {analytics.recentPosts.map((post) => (
            <Link
              key={post.id}
              href={post.status === "published" ? `/blog/${post.slug}` : `/admin/blog/${post.id}/edit`}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  {post.status === "published"
                    ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                    : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.claps_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
