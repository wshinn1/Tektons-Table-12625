import { createClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"

export const dynamic = "force-dynamic"

export default async function HelpSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q || ""

  const supabase = await createClient()

  // Search articles by title and content
  let articles: any[] = []

  if (query.trim()) {
    const { data } = await supabase
      .from("help_articles")
      .select("*, help_categories(name, slug)")
      .eq("is_published", true)
      .or(`title->>en.ilike.%${query}%,content->>en.ilike.%${query}%`)
      .order("view_count", { ascending: false })
      .limit(20)

    articles = data || []
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Help Center
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Search Results</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            {query ? `Showing results for "${query}"` : "Enter a search term to find help articles"}
          </p>

          <form action="/help/search" className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder="Search for help..."
                className="pl-10 h-12 text-base"
                defaultValue={query}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!query.trim() ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Enter a search term above to find help articles</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find any articles matching "{query}"</p>
            <Link href="/help" className="text-primary hover:underline">
              Browse all categories
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              Found {articles.length} article{articles.length !== 1 ? "s" : ""}
            </p>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/help/article/${article.slug}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="text-xs text-muted-foreground mb-2">
                        {article.help_categories?.name?.en || "General"}
                      </div>
                      <CardTitle className="text-base sm:text-lg mb-2">{article.title.en}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {article.content.en?.replace(/<[^>]*>/g, "")?.substring(0, 150)}...
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
