"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveBlogViewLayout } from "@/app/actions/tenant-settings"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Grid3X3, List } from "lucide-react"

interface BlogViewLayoutSettingsProps {
  tenantId: string
  currentLayout: "grid" | "list"
}

export function BlogViewLayoutSettings({ tenantId, currentLayout }: BlogViewLayoutSettingsProps) {
  const [layout, setLayout] = useState<"grid" | "list">(currentLayout || "grid")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await saveBlogViewLayout(tenantId, layout)

      if (result.success) {
        toast.success("Blog layout updated successfully")
      } else {
        toast.error(result.error || "Failed to update layout")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Layout</CardTitle>
        <CardDescription>Choose how blog posts are displayed on your public blog page</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Grid Layout Option */}
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                layout === "grid"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              {/* Grid Preview */}
              <div className="flex h-20 w-full items-center justify-center rounded bg-muted/50 p-2">
                <div className="grid grid-cols-3 gap-1 w-full h-full">
                  <div className="rounded bg-muted-foreground/20" />
                  <div className="rounded bg-muted-foreground/20" />
                  <div className="rounded bg-muted-foreground/20" />
                  <div className="rounded bg-muted-foreground/20" />
                  <div className="rounded bg-muted-foreground/20" />
                  <div className="rounded bg-muted-foreground/20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm font-medium">Grid</span>
              </div>
              {layout === "grid" && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* List Layout Option */}
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                layout === "list"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              {/* List Preview */}
              <div className="flex h-20 w-full flex-col justify-center gap-1.5 rounded bg-muted/50 p-2">
                <div className="flex gap-2 h-5">
                  <div className="w-6 rounded bg-muted-foreground/20" />
                  <div className="flex-1 rounded bg-muted-foreground/20" />
                </div>
                <div className="flex gap-2 h-5">
                  <div className="w-6 rounded bg-muted-foreground/20" />
                  <div className="flex-1 rounded bg-muted-foreground/20" />
                </div>
                <div className="flex gap-2 h-5">
                  <div className="w-6 rounded bg-muted-foreground/20" />
                  <div className="flex-1 rounded bg-muted-foreground/20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="text-sm font-medium">List</span>
              </div>
              {layout === "list" && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {layout === "grid"
              ? "Posts will be displayed in a masonry-style grid with featured images"
              : "Posts will be displayed in a vertical list with image thumbnails"}
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Update Layout"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
