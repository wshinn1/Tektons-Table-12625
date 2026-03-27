import { getBlogPosts } from "@/app/actions/blog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BlogPostList } from "@/components/tenant/blog-post-list"
import { PlusCircle } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ tenant: string }>
}

export default async function TenantBlogPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants").select("id, subdomain").eq("subdomain", tenantSlug).limit(1).single()
  if (!tenant) notFound()
  const posts = await getBlogPosts({ tenantId: tenant.id })
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button asChild>
          <a href={`/${tenantSlug}/admin/blog/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </a>
        </Button>
      </div>
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <Button asChild><a href={`/${tenantSlug}/admin/blog/create`}>Create your first post</a></Button>
          </CardContent>
        </Card>
      ) : (
        <BlogPostList posts={posts as any} tenantSlug={tenantSlug} tenantId={tenant.id} />
      )}
    </div>
  )
}
