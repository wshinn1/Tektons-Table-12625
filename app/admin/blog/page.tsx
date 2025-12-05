import { getBlogPosts } from "@/app/actions/blog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"

export default async function BlogManagementPage() {
  const posts = await getBlogPosts({ tenantId: "platform" })

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-1 text-gray-500">Manage platform blog articles and updates</p>
        </div>
        <Link href="/admin/blog/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold">No blog posts yet</h3>
            <p className="mt-2 text-sm text-gray-600">Get started by creating your first blog post</p>
            <Link href="/admin/blog/create">
              <Button className="mt-4">Create First Post</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {post.subtitle && <p className="mt-1 text-gray-600">{post.subtitle}</p>}

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    {post.status === "published" && post.published_at ? (
                      <span>Published {format(new Date(post.published_at), "MMM d, yyyy")}</span>
                    ) : (
                      <span>Last edited {format(new Date(post.updated_at), "MMM d, yyyy")}</span>
                    )}
                    <span>•</span>
                    <span>{post.read_time} min read</span>
                    {post.categories && post.categories.length > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {post.categories
                            .map((cat: any) => cat.category.name)
                            .slice(0, 2)
                            .join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {post.status === "published" && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
