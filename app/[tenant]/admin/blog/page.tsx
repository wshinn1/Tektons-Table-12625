import { getBlogPosts } from "@/app/actions/blog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    tenant: string
  }>
}

export default async function TenantBlogPage({ params }: Props) {
  const { tenant: tenantSlug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase.from("tenants").select("id").eq("subdomain", tenantSlug).limit(1).single()

  if (!tenant) {
    notFound()
  }

  const posts = await getBlogPosts({ tenantId: tenant.id })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button asChild>
          <Link href={`/admin/blog/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No blog posts yet</p>
              <Button asChild>
                <Link href={`/admin/blog/create`}>Create your first post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: any) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                    {post.subtitle && <CardDescription className="line-clamp-2">{post.subtitle}</CardDescription>}
                  </div>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {post.view_count || 0} views • {post.read_time_minutes || 0} min read
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
