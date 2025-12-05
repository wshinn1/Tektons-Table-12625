import { createClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { notFound } from "next/navigation"

export default async function HelpCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Get category
  const { data: category } = await supabase.from("help_categories").select("*").eq("slug", slug).single()

  if (!category) {
    notFound()
  }

  // Get articles in this category
  const { data: articles } = await supabase
    .from("help_articles")
    .select("*")
    .eq("category", slug)
    .eq("is_published", true)
    .order("order_index")

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Link
            href="/help"
            className="inline-flex items-center text-sm sm:text-base text-primary hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{category.name.en}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {articles?.length || 0} article{articles?.length !== 1 ? "s" : ""} in this category
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base sm:text-lg text-muted-foreground mb-4 px-4">
              {slug === "fundraising"
                ? "This section is coming soon! We're working on comprehensive fundraising guides."
                : "No articles available in this category yet."}
            </p>
            <Link href="/help" className="text-primary hover:underline text-sm sm:text-base">
              Browse other categories
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6 max-w-5xl">
            {articles.map((article) => (
              <Link key={article.id} href={`/help/article/${article.slug}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl mb-2">{article.title.en}</CardTitle>
                    <CardDescription className="line-clamp-3 text-sm">
                      {article.content.en?.replace(/<[^>]*>/g, "")?.substring(0, 200)}
                      ...
                    </CardDescription>
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        {article.view_count} views
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
