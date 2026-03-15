import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BlogPostRenderer } from "@/components/blog/blog-post-renderer"
import { BlogEngagement } from "@/components/blog/blog-engagement"
import { BlogComments } from "@/components/blog/blog-comments"
import { ReadingProgress } from "@/components/blog/reading-progress"
import { generateBlogJsonLd } from "@/components/blog/blog-seo"
import { Button } from "@/components/ui/button"
import { Lock, Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GivingWidget } from "@/components/tenant/giving-widget"
import { CampaignWidget } from "@/components/tenant/campaign-widget"
import { SubscribeCTA } from "@/components/tenant/subscribe-cta"
import { getTotalRaised, getRecentDonors, getGivingStats } from "@/app/actions/giving"
import { Montserrat, Bebas_Neue, Raleway } from "next/font/google"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { PersonSchema } from "@/components/seo/person-schema"

const montserrat = Montserrat({
  weight: ["900"],
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

const bebasNeue = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
  fallback: ["Impact", "sans-serif"],
})

const raleway = Raleway({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

async function getTenant(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("tenants").select("*").eq("subdomain", slug).maybeSingle()

  if (error || !data) return null
  return data
}

async function getBlogPost(slug: string, tenantId: string) {
  const supabase = await createServerClient()

  const decodedSlug = decodeURIComponent(slug)

  console.log("[v0] Fetching blog post:", { slug: decodedSlug, tenantId })

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      categories:blog_post_categories(category:blog_categories(*)),
      tags:blog_post_tags(tag:blog_tags(*))
    `,
    )
    .eq("slug", decodedSlug)
    .eq("tenant_id", tenantId.toString())
    .eq("status", "published")
    .maybeSingle()

  if (error) {
    console.error("[v0] Failed to fetch blog post - Supabase error:", error)
    return null
  }

  if (!data) {
    console.log("[v0] Blog post not found:", { slug: decodedSlug, tenantId, status: "published" })
    return null
  }

  console.log("[v0] Blog post found:", { id: data.id, title: data.title })

  // Increment view count
  await supabase.rpc("increment_blog_views", { post_id: data.id })

  return data
}

async function checkFollowerStatus(tenantId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { isFollower: false, isPending: false }

  const { data } = await supabase
    .from("tenant_followers")
    .select("status")
    .eq("tenant_id", tenantId)
    .eq("follower_id", user.id)
    .maybeSingle()

  return {
    isFollower: data?.status === "approved",
    isPending: data?.status === "pending",
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}) {
  const { tenant: tenantSlug, slug } = await params
  const tenant = await getTenant(tenantSlug)

  if (!tenant) {
    return { title: "Tenant Not Found" }
  }

  const post = await getBlogPost(slug, tenant.id)

  if (!post) {
    return { title: "Post Not Found" }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const url = `${baseUrl}/blog/${post.slug}`
  const description = post.excerpt || post.meta_description || post.subtitle || `Read ${post.title}`

  return {
    title: post.title,
    description: description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: post.seo_index !== false,
      follow: post.seo_follow !== false,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    openGraph: {
      title: post.title,
      description: description,
      url: url,
      siteName: tenant.name || "Blog",
      images: post.featured_image_url
        ? [
            {
              url: post.featured_image_url,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author_name || "Anonymous"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

export default async function TenantBlogPostPage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}) {
  const { tenant: tenantSlug, slug } = await params
  const tenant = await getTenant(tenantSlug)

  if (!tenant) {
    notFound()
  }

  const post = await getBlogPost(slug, tenant.id)

  if (!post) {
    notFound()
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === tenant.id
  const { isFollower, isPending } = await checkFollowerStatus(tenant.id)
  const canViewContent = !post.followers_only || isOwner || isFollower

  const { data: activeCampaigns } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .eq("show_in_menu", true)
    .order("created_at", { ascending: false })
    .limit(1)

  const activeCampaign = activeCampaigns && activeCampaigns.length > 0 ? activeCampaigns[0] : null

  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single()

  const blogWidgetPreference = givingSettings?.blog_widget_preference || "giving"
  const showCampaignWidget = blogWidgetPreference === "campaign" && activeCampaign
  const showGivingWidget = blogWidgetPreference === "giving" || !showCampaignWidget

  const showWidget = givingSettings?.show_progress_widget ?? false
  const showDonorNames = givingSettings?.show_donor_names ?? false
  const targetGoal = givingSettings?.fundraising_target_goal || 5000

  let totalRaised = 0
  let recentDonors: any[] = []
  let donationCount = 0
  let campaignStats = null

  if (showCampaignWidget && activeCampaign) {
    const progressPercent =
      activeCampaign.goal_amount > 0
        ? Math.min((activeCampaign.current_amount / activeCampaign.goal_amount) * 100, 100)
        : 0

    // Count donations for this campaign
    const { count } = await supabase
      .from("campaign_donations")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", activeCampaign.id)

    campaignStats = {
      campaign: activeCampaign,
      progressPercent,
      donationCount: count || 0,
    }
  } else if (showGivingWidget && showWidget) {
    // Only fetch giving stats if showing giving widget
    totalRaised = await getTotalRaised(tenant.id)
    recentDonors = await getRecentDonors(tenant.id, 5)
    const stats = await getGivingStats(tenant.id)
    donationCount = stats.supportersCount
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const jsonLd = generateBlogJsonLd(
    {
      title: post.title,
      subtitle: post.subtitle,
      slug: post.slug,
      featuredImageUrl: post.featured_image_url,
      metaDescription: post.meta_description,
      publishedAt: post.published_at,
      author: { email: post.author_name || post.author_id || "Anonymous" },
      tenantId: post.tenant_id,
    },
    baseUrl,
  )

  const formattedDate = post.published_at
    ? new Date(post.published_at)
        .toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase()
    : ""

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BreadcrumbSchema
        items={[
          { name: "Home", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: post.title, url: postUrl },
        ]}
      />

      {post.author_name && (
        <PersonSchema name={post.author_name} jobTitle="Missionary" description={`Author of ${post.title}`} />
      )}

      {post.navbar_visible === false && (
        <div className="fixed top-4 left-4 z-50">
          <Link
            href={`/${tenantSlug}/blog/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-2 text-sm text-foreground hover:bg-background transition-colors shadow-lg border"
          >
            Show Navigation
          </Link>
        </div>
      )}

      <main className={`min-h-screen bg-background ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}>
        <ReadingProgress />

        <div className="relative max-w-7xl mx-auto">
          {/* Centered content container */}
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 sm:px-8">
            {/* Minimal back button */}
            <Link
              href={`/${tenantSlug}/blog`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Blog</span>
            </Link>

            <div className="text-center">
              {/* Metadata */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground font-raleway">
                <span>Written by {post.author_name || "Unknown Author"}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time_minutes || 5} min read</span>
                </div>
                {post.categories && post.categories.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-foreground">
                      {post.categories.map((cat: any) => cat.category.name).join(", ")}
                    </span>
                  </>
                )}
              </div>

              <h1 className="mb-8 text-4xl font-black leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl font-montserrat">
                {post.title}
              </h1>

              {(post.excerpt || post.subtitle) && (
                <p className="mb-12 text-xl leading-relaxed text-muted-foreground text-pretty font-raleway">
                  {post.excerpt || post.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 pb-16 sm:px-8">
            <article className="font-raleway">
              {post.featured_image_url && post.show_featured_image && (
                <div className="mb-12">
                  <div className="relative aspect-square w-full max-w-2xl mx-auto overflow-hidden bg-muted">
                    <img
                      src={post.featured_image_url || "/placeholder.svg"}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {post.featured_image_caption && (
                    <p className="mt-3 text-center text-sm text-muted-foreground italic max-w-2xl mx-auto">
                      {post.featured_image_caption}
                    </p>
                  )}
                </div>
              )}

              {canViewContent ? (
                <>
                  <BlogPostRenderer content={post.content} />

                  <div className="my-12">
                    <SubscribeCTA tenantName={tenant.full_name || tenant.subdomain} tenantSlug={tenantSlug} />
                  </div>

                  <BlogEngagement postId={post.id} postTitle={post.title} postUrl={postUrl} />

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 flex flex-wrap gap-3">
                      {post.tags.map((tagItem: any) => (
                        <span
                          key={tagItem.tag.id}
                          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                          {tagItem.tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div id="comments-section">
                    <BlogComments postId={post.id} />
                  </div>
                </>
              ) : (
                <div className="my-16 rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 text-center">
                  <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Followers Only Content</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isPending
                      ? "Your follow request is pending approval. You'll be able to view this content once approved."
                      : "This post is restricted to approved followers. Follow this missionary to request access."}
                  </p>
                  {!user && (
                    <Button asChild>
                      <Link href={`/auth/login?redirect=/${tenantSlug}/blog/${slug}`}>Sign In to Follow</Link>
                    </Button>
                  )}
                  {user && !isPending && !isFollower && (
                    <p className="text-sm text-muted-foreground">
                      Use the Follow button in the header to request access
                    </p>
                  )}
                </div>
              )}
            </article>
          </div>

          {showCampaignWidget && campaignStats ? (
            <aside className="fixed right-8 top-32 w-72 z-10">
              <CampaignWidget
                campaign={campaignStats.campaign}
                progressPercent={campaignStats.progressPercent}
                donationCount={campaignStats.donationCount}
                subdomain={tenant.subdomain}
              />
            </aside>
          ) : showGivingWidget && showWidget ? (
            <aside className="fixed right-8 top-32 w-72 z-10">
              <GivingWidget
                subdomain={tenant.subdomain}
                raisedAmount={totalRaised}
                goalAmount={targetGoal}
                donationCount={donationCount}
                showDonorNames={showDonorNames}
                recentDonors={recentDonors}
                compact={true}
              />
            </aside>
          ) : null}
        </div>
      </main>
    </>
  )
}
