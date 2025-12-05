import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Send } from 'lucide-react'

export default async function PostsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!tenant) redirect('/onboarding')

  // Get posts with categories and topics
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(name, slug),
      post_topics(topic:topics(name, slug))
    `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage your ministry updates and content</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/posts/categories">
              Manage Categories
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/posts/topics">
              Manage Topics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter by category */}
      {categories && categories.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/posts">All Posts</Link>
          </Button>
          {categories.map((cat) => (
            <Button key={cat.id} variant="outline" size="sm" asChild>
              <Link href={`/dashboard/posts?category=${cat.slug}`}>
                {cat.name}
              </Link>
            </Button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      <div className="grid gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {post.status === 'published' && (
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/dashboard/posts/${post.id}/notify`}>
                          <Send className="h-4 w-4 mr-1" />
                          Notify
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                  {post.category && (
                    <Badge variant="outline">{post.category.name}</Badge>
                  )}
                  {post.post_topics?.map((pt: any) => (
                    <Badge key={pt.topic.slug} variant="outline">
                      {pt.topic.name}
                    </Badge>
                  ))}
                </div>
                {post.excerpt && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No posts yet. Create your first ministry update!</p>
              <Button asChild>
                <Link href="/dashboard/posts/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
