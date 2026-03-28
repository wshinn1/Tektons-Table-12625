"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"

interface TopPage {
  path: string
  views: number
}

interface DashboardTopPagesProps {
  subdomain: string
}

export function DashboardTopPages({ subdomain }: DashboardTopPagesProps) {
  const [topBlogPosts, setTopBlogPosts] = useState<TopPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTopPages() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/analytics/tenant?subdomain=${subdomain}&days=7`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch analytics")
        }

        // Filter to only include blog post paths (e.g., /blog/slug)
        const blogPosts = (data.topPages || []).filter(
          (p: TopPage) => p.path?.startsWith("/blog/") && p.path !== "/blog/"
        )

        setTopBlogPosts(blogPosts)
      } catch (err) {
        console.error("[DashboardTopPages] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to load page data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopPages()
  }, [subdomain])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Extract just the blog post slug from the path for display
  const formatPath = (path: string) => path.replace("/blog/", "").replace(/-/g, " ")

  const maxViews = topBlogPosts.length > 0 ? topBlogPosts[0].views : 1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Top Blog Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : topBlogPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No blog post view data yet.</p>
        ) : (
          <div className="space-y-3">
            {topBlogPosts.slice(0, 5).map((page, index) => {
              const percentage = (page.views / maxViews) * 100
              return (
                <div key={page.path || index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[200px]" title={page.path}>
                      {formatPath(page.path)}
                    </span>
                    <span className="text-gray-500 font-medium">{formatNumber(page.views)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Link
          href={`/${subdomain}/admin/analytics`}
          className="block text-sm text-blue-600 hover:underline mt-4"
        >
          View full analytics &rarr;
        </Link>
      </CardContent>
    </Card>
  )
}
