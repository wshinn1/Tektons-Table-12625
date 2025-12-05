import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"

async function getAuthorProfile(authorId: string) {
  const supabase = await createServerClient()

  const { data } = await supabase.from("supporter_profiles").select("full_name, email").eq("id", authorId).maybeSingle()

  return data
}

export async function BlogPostHeader({
  title,
  subtitle,
  authorName,
  authorId,
  publishedAt,
  readTime,
}: {
  title: string
  subtitle?: string | null
  authorName?: string | null
  authorId: string
  publishedAt: string
  readTime: number
}) {
  const author = authorName ? null : await getAuthorProfile(authorId)
  const displayName = authorName || author?.full_name || "Anonymous"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <header className="mb-10">
      <h1 className="mb-4 text-balance font-sans text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]">
        {title}
      </h1>

      {subtitle && (
        <p className="mb-8 text-balance text-xl font-normal leading-relaxed text-muted-foreground sm:text-2xl md:mb-10">
          {subtitle}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground sm:text-base">{displayName}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-3 text-xs font-medium text-primary hover:bg-primary/10 sm:h-8 sm:px-4 sm:text-sm"
          >
            Follow
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <span>{readTime} min read</span>
          <span>·</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </div>
      </div>
    </header>
  )
}
