import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Clock, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"

function convertToHtml(content: string): string {
  // If content already has HTML tags, return as-is
  if (/<(h[1-6]|ul|ol|li|p|div|span|strong|em)\b/i.test(content)) {
    return content
  }

  // Split by double newlines for paragraphs, single newlines for lines within paragraphs
  const sections = content.split(/\n\s*\n/).filter((s) => s.trim())
  let html = ""

  for (const section of sections) {
    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l)

    if (lines.length === 0) continue

    const firstLine = lines[0]

    // Check if this section starts with a heading
    const isHeading =
      firstLine.endsWith("?") ||
      firstLine.endsWith(":") ||
      (firstLine.length < 50 && lines.length === 1 && /^[A-Z]/.test(firstLine) && !firstLine.includes("."))

    if (isHeading && lines.length === 1) {
      html += `<h2>${firstLine.replace(/[?:]$/, "")}</h2>\n`
    } else if (lines.every((l) => l.startsWith("-") || l.startsWith("•") || l.startsWith("*"))) {
      // All lines are bullets
      html += "<ul>\n"
      for (const line of lines) {
        html += `<li>${line.replace(/^[-•*]\s*/, "")}</li>\n`
      }
      html += "</ul>\n"
    } else if (lines.length > 1 && lines.slice(1).every((l) => l.length < 80)) {
      // First line might be a heading, rest are bullets
      const possibleHeading = lines[0]
      if (possibleHeading.endsWith(":") || possibleHeading.endsWith("?")) {
        html += `<h2>${possibleHeading.replace(/[?:]$/, "")}</h2>\n`
        html += "<ul>\n"
        for (const line of lines.slice(1)) {
          const bulletText = line.replace(/^[-•*]\s*/, "")
          if (bulletText.includes(":")) {
            const [label, ...rest] = bulletText.split(":")
            html += `<li><strong>${label}:</strong>${rest.join(":")}</li>\n`
          } else {
            html += `<li>${bulletText}</li>\n`
          }
        }
        html += "</ul>\n"
      } else {
        // Just a paragraph
        html += `<p>${lines.join(" ")}</p>\n`
      }
    } else {
      // Regular paragraph
      html += `<p>${lines.join(" ")}</p>\n`
    }
  }

  return html
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("help_articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!article) {
    notFound()
  }

  // Increment view count
  await supabase
    .from("help_articles")
    .update({ view_count: article.view_count + 1 })
    .eq("id", article.id)

  const { data: relatedArticles } = await supabase
    .from("help_articles")
    .select("id, slug, title")
    .in("id", article.related_articles || [])
    .eq("is_published", true)
    .limit(3)

  const rawContent =
    typeof article.content === "string" ? article.content : article.content?.en || article.content?.toString() || ""

  console.log("[v0] Article content type:", typeof article.content)
  console.log("[v0] Article content preview:", rawContent.substring(0, 200))

  const htmlContent = convertToHtml(rawContent)

  const title = typeof article.title === "string" ? article.title : article.title?.en || "Help Article"

  const getRelatedTitle = (related: { title: string | { en?: string } }) => {
    return typeof related.title === "string" ? related.title : related.title?.en || "Related Article"
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/help" className="inline-flex items-center text-sm sm:text-base text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
        </div>

        <article>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance">{title}</h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Last updated: {new Date(article.updated_at).toLocaleDateString()}
            </span>
            <span>{article.view_count} views</span>
          </div>

          {article.video_url && (
            <div className="aspect-video mb-6 md:mb-8 rounded-lg overflow-hidden">
              <iframe src={article.video_url} className="w-full h-full" allowFullScreen />
            </div>
          )}

          <div
            className="prose prose-slate dark:prose-invert max-w-none mb-8 md:mb-12 
              prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-3 prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-foreground prose-p:leading-7 prose-p:mb-4
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
              prose-li:text-foreground prose-li:leading-relaxed prose-li:mb-2 prose-li:marker:text-muted-foreground
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80"
          >
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          <div className="border-t pt-6 md:pt-8 mb-6 md:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Was this article helpful?</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <form action="/api/help/feedback" method="POST">
                <input type="hidden" name="article_id" value={article.id} />
                <input type="hidden" name="was_helpful" value="true" />
                <Button type="submit" variant="outline" size="sm" className="text-sm bg-transparent">
                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Yes ({article.helpful_count})
                </Button>
              </form>
              <form action="/api/help/feedback" method="POST">
                <input type="hidden" name="article_id" value={article.id} />
                <input type="hidden" name="was_helpful" value="false" />
                <Button type="submit" variant="outline" size="sm" className="text-sm bg-transparent">
                  <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  No ({article.not_helpful_count})
                </Button>
              </form>
            </div>
          </div>

          {relatedArticles && relatedArticles.length > 0 && (
            <div className="border-t pt-6 md:pt-8">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Related Articles</h3>
              <div className="space-y-2">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/help/article/${related.slug}`}
                    className="block p-3 sm:p-4 border rounded-lg hover:border-primary transition-colors text-sm sm:text-base"
                  >
                    {getRelatedTitle(related)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
