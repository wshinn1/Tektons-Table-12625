import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BookOpen, Clock, Lock, ChevronRight, Sparkles, ArrowLeft } from "lucide-react"
import { ResourceCategoryNav } from "@/components/resources/resource-category-nav"
import { PremiumSubscriptionCta } from "@/components/resources/premium-subscription-cta"

interface PageProps {
  params: Promise<{ categorySlug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { categorySlug } = await params
  const supabase = await createServerClient()
  const { data: category } = await supabase
    .from("resource_categories")
    .select("name, description")
    .eq("slug", categorySlug)
    .maybeSingle()

  return {
    title: `${category?.name || "Category"} | Resources | Tekton's Table`,
    description: category?.description || "Browse resources in this category",
  }
}

async function getCategories() {
  const supabase = await createServerClient()
  const { data } = await supabase.from("resource_categories").select("*").order("display_order", { ascending: true })
  return data || []
}

async function getCategory(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("resource_categories").select("*").eq("slug", slug).maybeSingle()

  if (error || !data) return null
  return data
}

async function getResourcesByCategory(categoryId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("resource_category_assignments")
    .select(`
      resource_id,
      platform_resources (
        id,
        title,
        slug,
        excerpt,
        featured_image,
        is_premium,
        word_count,
        estimated_read_time,
        published_at,
        status
      )
    `)
    .eq("category_id", categoryId)

  if (error) {
    console.error("Error fetching resources:", error)
    return []
  }

  return (data || [])
    .map((item: any) => item.platform_resources)
    .filter((r: any) => r && r.status === "published")
    .sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
}

async function checkPremiumAccess() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: subscription } = await supabase
    .from("premium_subscriptions")
    .select("status, current_period_end, grace_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subscription) {
    const now = new Date()
    if (subscription.status === "active" || subscription.status === "trialing") return true
    if (
      subscription.status === "canceled" &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end) > now
    )
      return true
    if (
      subscription.status === "past_due" &&
      subscription.grace_period_end &&
      new Date(subscription.grace_period_end) > now
    )
      return true
  }

  const { data: comped } = await supabase
    .from("comped_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (comped && (!comped.expires_at || new Date(comped.expires_at) > new Date())) return true

  return false
}

function ResourceCard({
  resource,
  categorySlug,
  hasPremiumAccess,
}: { resource: any; categorySlug: string; hasPremiumAccess: boolean }) {
  const isLocked = resource.is_premium && !hasPremiumAccess

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <Link href={`/resources/category/${categorySlug}/${resource.slug}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {resource.featured_image ? (
            <img
              src={resource.featured_image || "/placeholder.svg"}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <BookOpen className="w-12 h-12 text-primary/40" />
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          {resource.is_premium && (
            <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {resource.excerpt || "Read this resource to learn more..."}
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {resource.estimated_read_time || 5} min read
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </CardFooter>
      </Link>
    </Card>
  )
}

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params

  const [categories, category, hasPremiumAccess] = await Promise.all([
    getCategories(),
    getCategory(categorySlug),
    checkPremiumAccess(),
  ])

  if (!category) {
    notFound()
  }

  const resources = await getResourcesByCategory(category.id)

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Resources
            </Link>

            <div className="flex items-center gap-4">
              {category.is_premium && (
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{category.name}</h1>
                {category.description && <p className="text-lg text-muted-foreground">{category.description}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="py-6 px-6 border-b bg-card/50">
          <div className="max-w-7xl mx-auto">
            <ResourceCategoryNav categories={categories} activeSlug={categorySlug} />
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {resources.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource: any) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      categorySlug={categorySlug}
                      hasPremiumAccess={hasPremiumAccess}
                    />
                  ))}
                </div>

                {category.is_premium && !hasPremiumAccess && (
                  <div className="mt-12">
                    <PremiumSubscriptionCta variant="full" />
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">No Resources Yet</h2>
                <p className="text-muted-foreground mb-6">Resources in this category are coming soon.</p>
                <Link href="/resources" className="text-primary hover:underline">
                  Browse all resources
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
