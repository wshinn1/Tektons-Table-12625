"use client"

import dynamic from "next/dynamic"

const TiptapRenderer = dynamic(
  () => import("@/components/admin/blog/tiptap-renderer").then((mod) => mod.TiptapRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
    ),
  },
)

interface ResourceContentProps {
  content: any
}

export function ResourceContent({ content }: ResourceContentProps) {
  if (!content) {
    return <div className="text-center py-12 text-muted-foreground">No content available.</div>
  }

  return (
    <article className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/90">
      <TiptapRenderer content={content} />
    </article>
  )
}
