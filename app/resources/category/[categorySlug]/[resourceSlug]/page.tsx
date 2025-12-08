import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Sparkles, BookOpen } from "lucide-react"
import { ResourceContent } from "@/components/resources/resource-content"
import { PremiumPaywall } from "@/components/resources/premium-paywall"

interface PageProps {
  params: Promise<{ categorySlug: string; resourceSlug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { resourceSlug } = await params
  const supabase = await createServerClient()
  const { data: resource } = await supabase
    .from("platform_resources")
    .select("title, excerpt, meta_title, meta_description, featured_image")
    .eq("slug", resourceSlug)
    .eq("status", "published")
    .maybeSingle()

  return {
    title: resource?.meta_title || `${resource?.title || "Resource"} | Tekton's Table`,
    description: resource?.meta_description || resource?.excerpt || "Read this resource on Tekton's Table",
    openGraph: {
      title: resource?.meta_title || resource?.title,
      description: resource?.meta_description || resource?.excerpt,
      images: resource?.featured_image ? [resource.featured_image] : [],
    },
  }
}

async function getResource(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("platform_resources")
    .select(`
      *,
      resource_category_assignments (
        resource_categories (
          id,
          name,
          slug,
          is_premium
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (error || !data) return null
  return data
}

async function checkPremiumAccess() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { hasAccess: false, isLoggedIn: false, user: null }

  const { data: subscription } = await supabase
    .from("premium_subscriptions")
    .select("status, current_period_end, grace_period_end")
    .eq("user_id", user.id)
    .maybeSingle()

  if (subscription) {
    const now = new Date()
    if (subscription.status === "active" || subscription.status === "trialing") {
      return { hasAccess: true, isLoggedIn: true, user }
    }
    if (
      subscription.status === "canceled" &&
      subscription.current_period_end &&
      new Date(subscription.current_period_end) > now
    ) {
      return { hasAccess: true, isLoggedIn: true, user }
    }
    if (
      subscription.status === "past_due" &&
      subscription.grace_period_end &&
      new Date(subscription.grace_period_end) > now
    ) {
      return { hasAccess: true, isLoggedIn: true, user }
    }
  }

  const { data: comped } = await supabase
    .from("comped_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (comped && (!comped.expires_at || new Date(comped.expires_at) > new Date())) {
    return { hasAccess: true, isLoggedIn: true, user }
  }

  return { hasAccess: false, isLoggedIn: true, user }
}

async function getRelatedResources(resourceId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return []

  const supabase = await createServerClient()
  const { data } = await supabase
    .from("resource_category_assignments")
    .select(`
      platform_resources (
        id,
        title,
        slug,
        excerpt,
        featured_image,
        is_premium,
        estimated_read_time
      )
    `)
    .in("category_id", categoryIds)
    .neq("resource_id", resourceId)
    .limit(3)

  const resources = (data || []).map((item: any) => item.platform_resources).filter((r: any) => r && r.id)

  // Remove duplicates
  const uniqueResources = resources.filter(
    (r: any, i: number, arr: any[]) => arr.findIndex((item: any) => item.id === r.id) === i,
  )

  return uniqueResources.slice(0, 3)
}

export default async function ResourcePage({ params }: PageProps) {
  const { categorySlug, resourceSlug } = await params

  const [resource, accessInfo] = await Promise.all([getResource(resourceSlug), checkPremiumAccess()])

  if (!resource) {
    notFound()
  }

  const category = resource.resource_category_assignments?.[0]?.resource_categories
  const categoryIds =
    resource.resource_category_assignments?.map((a: any) => a.resource_categories?.id).filter(Boolean) || []

  const canViewContent = !resource.is_premium || accessInfo.hasAccess

  const relatedResources = await getRelatedResources(resource.id, categoryIds)

  const publishedDate = resource.published_at
    ? new Date(resource.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <main className="pt-20">
        {/* Breadcrumb & Header */}
        <section className="py-8 px-6 border-b">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/resources" className="hover:text-foreground transition-colors">
                Resources
              </Link>
              <span>/</span>
              {category && (
                <>
                  <Link
                    href={`/resources/category/${category.slug}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground truncate">{resource.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {resource.is_premium && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              {category && <Badge variant="outline">{category.name}</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {resource.title}
            </h1>

            {resource.excerpt && <p className="text-xl text-muted-foreground mb-6">{resource.excerpt}</p>}

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {publishedDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {publishedDate}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {resource.estimated_read_time || 5} min read
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {resource.word_count?.toLocaleString() || 0} words
              </span>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {resource.featured_image && (
          <section className="py-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-[21/9] rounded-xl overflow-hidden bg-muted">
                <img
                  src={resource.featured_image || "/placeholder.svg"}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            {canViewContent ? (
              <ResourceContent content={resource.content} />
            ) : (
              <PremiumPaywall resource={resource} isLoggedIn={accessInfo.isLoggedIn} categorySlug={categorySlug} />
            )}
          </div>
        </section>

        {/* Related Resources */}
        {relatedResources.length > 0 && canViewContent && (
          <section className="py-12 px-6 bg-muted/30 border-t">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Resources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedResources.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/resources/category/${categorySlug}/${related.slug}`}
                    className="group block bg-card rounded-lg overflow-hidden border hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/9] bg-muted overflow-hidden">
                      {related.featured_image ? (
                        <img
                          src={related.featured_image || "/placeholder.svg"}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{related.estimated_read_time || 5} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back Link */}
        <section className="py-8 px-6 border-t">
          <div className="max-w-4xl mx-auto">
            <Link
              href={category ? `/resources/category/${category.slug}` : "/resources"}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {category?.name || "Resources"}
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
