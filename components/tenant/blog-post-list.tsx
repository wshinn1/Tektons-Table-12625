"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  archiveBlogPost,
  unpublishBlogPost,
  unarchiveBlogPost,
  trashBlogPost,
  restoreFromTrash,
  emptyTrash,
} from "@/app/actions/blog"
import {
  Archive,
  ArchiveRestore,
  EyeOff,
  Loader2,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type PostStatus = "draft" | "published" | "archived" | "trash"
type Tab = "all" | PostStatus

interface Post {
  id: string
  title: string
  subtitle?: string | null
  slug: string
  status: PostStatus
  view_count?: number
  read_time_minutes?: number
}

interface BlogPostListProps {
  posts: Post[]
  tenantSlug: string
  tenantId: string
}

const statusVariant: Record<PostStatus, "default" | "secondary" | "outline" | "destructive"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
  trash: "destructive",
}

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
  { key: "trash", label: "Trash" },
]

export function BlogPostList({ posts: initialPosts, tenantSlug, tenantId }: BlogPostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [viewsBySlug, setViewsBySlug] = useState<Record<string, number>>({})
  const [viewsLoading, setViewsLoading] = useState(true)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [emptyingTrash, setEmptyingTrash] = useState(false)

  useEffect(() => {
    fetch(`/api/analytics/blog-views?subdomain=${tenantSlug}`)
      .then((r) => r.json())
      .then((data) => setViewsBySlug(data ?? {}))
      .catch(() => {})
      .finally(() => setViewsLoading(false))
  }, [tenantSlug])

  const addPending = (id: string) =>
    setPendingIds((prev) => new Set([...prev, id]))
  const removePending = (id: string) =>
    setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next })

  const handleAction = useCallback(
    async (
      postId: string,
      action: (id: string, tid: string) => Promise<void>,
      nextStatus: PostStatus,
    ) => {
      if (pendingIds.has(postId)) return
      addPending(postId)
      try {
        await action(postId, tenantId)
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status: nextStatus } : p)),
        )
      } catch (err) {
        console.error(err)
      } finally {
        removePending(postId)
      }
    },
    [pendingIds, tenantId],
  )

  const handleEmptyTrash = async () => {
    setEmptyingTrash(true)
    try {
      await emptyTrash(tenantId)
      setPosts((prev) => prev.filter((p) => p.status !== "trash"))
    } catch (err) {
      console.error(err)
    } finally {
      setEmptyingTrash(false)
    }
  }

  const filtered = activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab)
  const counts: Record<Tab, number> = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    archived: posts.filter((p) => p.status === "archived").length,
    trash: posts.filter((p) => p.status === "trash").length,
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty trash banner */}
      {activeTab === "trash" && counts.trash > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{counts.trash} post{counts.trash !== 1 ? "s" : ""} in trash</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={emptyingTrash}>
                {emptyingTrash ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                Empty Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {counts.trash} post{counts.trash !== 1 ? "s" : ""} in the trash.{" "}
                  <strong>This cannot be undone.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmptyTrash}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, permanently delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Post list */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {activeTab === "trash" ? "Trash is empty." : "No posts in this category."}
        </p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((post) => {
            const posthogViews = viewsBySlug[post.slug]
            const views = posthogViews !== undefined ? posthogViews : (post.view_count ?? 0)
            const isBusy = pendingIds.has(post.id)
            const isTrash = post.status === "trash"

            return (
              <Card key={post.id} className={isTrash ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                      {post.subtitle && (
                        <CardDescription className="line-clamp-2">{post.subtitle}</CardDescription>
                      )}
                    </div>
                    <Badge variant={statusVariant[post.status] ?? "secondary"} className="flex-shrink-0">
                      {post.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                      {viewsLoading ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          loading views…
                        </span>
                      ) : (
                        <span>{views} views</span>
                      )}
                      {" • "}
                      {post.read_time_minutes ?? 0} min read
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {isTrash ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleAction(post.id, restoreFromTrash, "draft")}
                        >
                          {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                          Restore
                        </Button>
                      ) : (
                        <>
                          {post.status === "published" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(post.id, unpublishBlogPost, "draft")}
                            >
                              {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                              Unpublish
                            </Button>
                          )}
                          {post.status === "archived" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(post.id, unarchiveBlogPost, "draft")}
                            >
                              {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ArchiveRestore className="h-3 w-3 mr-1" />}
                              Unarchive
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isBusy}
                              onClick={() => handleAction(post.id, archiveBlogPost, "archived")}
                            >
                              {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
                              Archive
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isBusy}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleAction(post.id, trashBlogPost, "trash")}
                          >
                            {isBusy ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
                            Trash
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/${tenantSlug}/admin/blog/${post.id}/edit`}>Edit</a>
                          </Button>
                          {post.status === "published" && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/${tenantSlug}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
