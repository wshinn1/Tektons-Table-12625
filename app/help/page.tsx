import { createClient } from "@/lib/supabase/server"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Users, Mail, DollarSign, Settings, BarChart, Globe } from "lucide-react"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"

const iconMap: Record<string, any> = {
  "getting-started": BookOpen,
  fundraising: DollarSign,
  "content-communication": Mail,
  "financial-management": BarChart,
  "settings-customization": Settings,
  supporters: Users,
  email: Mail,
  settings: Settings,
  analytics: BarChart,
  integrations: Globe,
}

export default async function HelpCenter() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("help_categories").select("*").order("order_index")

  const { data: articles } = await supabase
    .from("help_articles")
    .select("*")
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Help Center</h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">Find answers to your questions</p>

          <form action="/help/search" className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="search" name="q" placeholder="Search for help..." className="pl-10 h-12 text-base" />
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Browse by Category</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {categories?.map((category) => {
            const Icon = iconMap[category.slug] || BookOpen
            return (
              <Link key={category.id} href={`/help/category/${category.slug}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="p-4 sm:p-6">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
                    <CardTitle className="text-lg sm:text-xl">{category.name.en}</CardTitle>
                    <CardDescription className="text-sm">{category.description?.en}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>

        {articles && articles.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Popular Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/help/article/${article.slug}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-base sm:text-lg mb-2">{article.title.en}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {article.content.en?.replace(/<[^>]*>/g, "")?.substring(0, 150)}
                        ...
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
