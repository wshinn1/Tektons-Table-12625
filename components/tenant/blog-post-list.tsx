"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { archiveBlogPost, unpublishBlogPost, unarchiveBlogPost } from "@/app/actions/blog"
import { Archive, ArchiveRestore, EyeOff, Loader2 } from "lucide-react"

interface Post {
  id: string
  title: string
  subtitle?: string | null
  slug: string
  status: "draft" | "published" | "archived"
  view_count?: number
  read_time_minutes?: number
}

interface BlogPostListProps {
  posts: Post[]
  tenantSlug: string
  tenantId: string
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

export function BlogPostList({ posts: initialPosts, tenantSlug, tenantId }: BlogPostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [viewsBySlug, setViewsBySlug] = useState<Record<string, number>>({})
  const [viewsLoading, setViewsLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    fetch(`/api/analytics/blog-views?subdomain=${tenantSlug}`)
      .then((r) => r.json())
      .then((data) => setViewsBySlug(data ?? {}))
      .catch(() => {})
      .finally(() => setViewsLoading(false))
  }, [tenantSlug])

  const handleAction = (
    postId: string,
    action: (id: string, tid: string) => Promise<void>,
    nextStatus: Post["status"],
  ) => {
    setPendingId(postId)
    startTransition(async () => {
      try {
        await action(postId, tenantId)
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: nextStatus } : p)))
      } catch (err) {
        console.error(err)
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => {
        const posthogViews = viewsBySlug[post.slug]
        const views = posthogViews !== undefined ? posthogViews : (post.view_count ?? 0)
        const isBusy = pendingId === post.id
        return (
          <Card key={post.id} className={post.status === "archived" ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                  {post.subtitle && <CardDescription className="line-clamp-2">{post.subtitle}</CardDescription>}
                </div>
                <Badge variant={statusVariant[post.status] ?? "secondary"} className="flex-shrink-0">{post.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm text-muted-foreground">
                  {viewsLoading ? (
                    <span className="inline-flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />loading views…</span>
                  ) : (
                    <span>{views} views</span>
                  )}
                  {" • "}{post.read_time_minutes ?? 0} min read
                </div>
                <div className="flex gap-2 flex-wrap">
                  {post.status !== "archived" ? (
                    <Button variant="outline" size="sm" disabled={isBusy} onClick={() => handleAction(post.id, archiveBlogPost, "archived")}>
                      {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
                      Archive
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled={isBusy} onClick={() => handleAction(post.id, unarchiveBlogPost, "draft")}>
                      {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ArchiveRestore className="h-3 w-3 mr-1" />}
                      Unarchive
                    </Button>
                  )}
                  {post.status === "published" && (
                    <Button variant="outline" size="sm" disabled={isBusy} onClick={() => handleAction(post.id, unpublishBlogPost, "draft")}>
                      {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                      Unpublish
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/${tenantSlug}/admin/blog/${post.id}/edit`}>Edit</a>
                  </Button>
                  {post.status === "published" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/${tenantSlug}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
