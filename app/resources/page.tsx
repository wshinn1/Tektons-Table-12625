import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { BookOpen, Clock, Lock, ChevronRight, Sparkles } from "lucide-react"
import { ResourceCategoryNav } from "@/components/resources/resource-category-nav"
import { PremiumSubscriptionCta } from "@/components/resources/premium-subscription-cta"

export const metadata = {
  title: "Resources | Tekton's Table",
  description: "Fundraising resources, guides, and articles to help missionaries raise support effectively.",
}

async function getCategories() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("resource_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data || []
}

async function getResources() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("platform_resources")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      is_premium,
      word_count,
      estimated_read_time,
      published_at,
      resource_category_assignments (
        category_id,
        resource_categories (
          id,
          name,
          slug,
          is_premium,
          icon,
          color
        )
      )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("Error fetching resources:", error)
    return []
  }
  return data || []
}

async function checkPremiumAccess() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // Check for active subscription
  const { data: subscription } = await supabase
    .from("premium_subscriptions")
    .select("status, current_period_end, grace_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subscription) {
    const now = new Date()
    if (subscription.status === "active" || subscription.status === "trialing") {
      return true
    }
    if (
      subscription.status === "canceled" &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end) > now
    ) {
      return true
    }
    if (
      subscription.status === "past_due" &&
      subscription.grace_period_end &&
      new Date(subscription.grace_period_end) > now
    ) {
      return true
    }
  }

  // Check for comped access
  const { data: comped } = await supabase
    .from("comped_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (comped) {
    if (!comped.expires_at || new Date(comped.expires_at) > new Date()) {
      return true
    }
  }

  return false
}

function ResourceCard({ resource, hasPremiumAccess }: { resource: any; hasPremiumAccess: boolean }) {
  const category = resource.resource_category_assignments?.[0]?.resource_categories
  const isLocked = resource.is_premium && !hasPremiumAccess

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <Link href={`/resources/category/${category?.slug || "free-resources"}/${resource.slug}`}>
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
          {category && (
            <Badge variant="outline" className="w-fit text-xs mb-2">
              {category.name}
            </Badge>
          )}
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
            <span>{resource.word_count?.toLocaleString() || 0} words</span>
          </div>
          <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </CardFooter>
      </Link>
    </Card>
  )
}

export default async function ResourcesPage() {
  const [categories, resources, hasPremiumAccess] = await Promise.all([
    getCategories(),
    getResources(),
    checkPremiumAccess(),
  ])

  const freeResources = resources.filter((r: any) => !r.is_premium)
  const premiumResources = resources.filter((r: any) => r.is_premium)

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Fundraising Resources</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Expert guides, articles, and strategies to help missionaries raise support effectively.
            </p>

            {!hasPremiumAccess && <PremiumSubscriptionCta variant="compact" />}
          </div>
        </section>

        {/* Category Navigation */}
        <section className="py-6 px-6 border-b bg-card/50">
          <div className="max-w-7xl mx-auto">
            <ResourceCategoryNav categories={categories} activeSlug={null} />
          </div>
        </section>

        {/* Premium Resources Section */}
        {premiumResources.length > 0 && (
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Premium Resources</h2>
                  <p className="text-muted-foreground text-sm">In-depth guides and expert strategies</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumResources.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} hasPremiumAccess={hasPremiumAccess} />
                ))}
              </div>

              {!hasPremiumAccess && premiumResources.length > 0 && (
                <div className="mt-8">
                  <PremiumSubscriptionCta variant="full" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Free Resources Section */}
        {freeResources.length > 0 && (
          <section className="py-12 px-6 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Free Resources</h2>
                  <p className="text-muted-foreground text-sm">Get started with these free guides</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeResources.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} hasPremiumAccess={hasPremiumAccess} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {resources.length === 0 && (
          <section className="py-20 px-6 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Resources Coming Soon</h2>
            <p className="text-muted-foreground">
              We're working on creating valuable resources for you. Check back soon!
            </p>
          </section>
        )}
      </main>

      <MarketingFooter />
    </div>
  )
}
