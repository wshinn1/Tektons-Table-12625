import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SectionRenderer } from "@/components/sections/section-renderer"
import { headers } from "next/headers"
import { CollapsibleCTA } from "@/components/tenant/collapsible-cta"
import { GivingWidget } from "@/components/tenant/giving-widget"
import { CampaignWidget } from "@/components/tenant/campaign-widget"
import { getTotalRaised, getRecentDonors, getGivingStats } from "@/app/actions/giving"
import PlatformHomePage from "@/app/page"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Montserrat, Bebas_Neue, Raleway } from "next/font/google"
import { OrganizationSchema } from "@/components/seo/organization-schema"
import { PuckPageRender } from "@/components/tenant/puck-page-editor"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-montserrat",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-raleway",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"],
})

export const revalidate = 60 // Revalidate every 60 seconds for fresh data

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params

  const supabase = await createServerClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, subdomain, full_name, bio, profile_image_url")
    .eq("subdomain", tenantSlug)
    .eq("is_active", true)
    .single()

  if (!tenant) {
    return { title: "Tenant Not Found" }
  }

  const baseUrl = `https://${tenantSlug}.tektonstable.com`
  const description = tenant.bio || `Support ${tenant.full_name}'s ministry through recurring donations`

  return {
    title: tenant.full_name,
    description,
    alternates: {
      canonical: baseUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    openGraph: {
      title: tenant.full_name,
      description,
      url: baseUrl,
      siteName: tenant.full_name,
      images: tenant.profile_image_url
        ? [
            {
              url: tenant.profile_image_url,
              width: 1200,
              height: 630,
              alt: tenant.full_name,
            },
          ]
        : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tenant.full_name,
      description,
      images: tenant.profile_image_url ? [tenant.profile_image_url] : [],
    },
  }
}

export default async function TenantHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { tenant: tenantSlug } = await params
  const { page: pageParam } = await searchParams
  const currentPage = Number.parseInt(pageParam || "1", 10)
  const postsPerPage = 4 // 2x2 grid

  const headersList = await headers()
  const subdomain = headersList.get("x-tenant-subdomain") || ""

  if (!subdomain) {
    console.log("[v0] Tenant page - No subdomain header, rendering platform homepage")
    return <PlatformHomePage />
  }

  console.log("[v0] Tenant page - subdomain from header:", subdomain, "tenant slug:", tenantSlug)

  const supabase = await createServerClient()

  const tenantResult = await supabase
    .from("tenants")
    .select(
      "id, subdomain, full_name, email, bio, profile_image_url, mission_organization, location, ministry_focus, primary_color, is_active",
    )
    .eq("subdomain", subdomain)
    .eq("is_active", true)
    .limit(1)
    .single()

  const tenant = tenantResult.data

  if (tenantResult.error || !tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div id="tenant-data" data-tenant-id="" style={{ display: "none" }} />
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Missionary Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The missionary page you're looking for doesn't exist or hasn't been set up yet.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { data: givingSettingsResult } = await supabase
    .from("tenant_giving_settings")
    .select("homepage_widget_preference, show_donor_names, fundraising_target_goal")
    .eq("tenant_id", tenant.id)
    .maybeSingle()

  const givingSettings = givingSettingsResult

  console.log("[v0] Tenant page - Loaded data:", { tenant: tenant?.subdomain, givingSettings })

  const adminClient = createAdminClient()

  const [postsCountResult, postsResult, homepageResult, activeCampaignsResult, customHomepageResult] =
    await Promise.all([
      adminClient
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", String(tenant.id))
        .eq("status", "published"),

      adminClient
        .from("blog_posts")
        .select(`
        id,
        slug,
        title,
        excerpt,
        featured_image_url,
        published_at,
        blog_post_categories (
          blog_categories (
            name,
            slug
          )
        )
      `)
        .eq("tenant_id", String(tenant.id))
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1),

      supabase
        .from("pages")
        .select(`
        id,
        title,
        slug,
        is_homepage,
        page_sections (
          id,
          order_index,
          is_visible,
          props,
          section_templates (
            id,
            name,
            component_path
          )
        )
      `)
        .eq("is_homepage", true)
        .eq("tenant_id", tenant.id)
        .eq("is_published", true)
        .maybeSingle(),

      adminClient
        .from("tenant_campaigns")
        .select("id, slug, title, goal_amount, current_amount")
        .eq("tenant_id", tenant.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),

      adminClient
        .from("tenant_pages")
        .select("id, title, slug, design_json")
        .eq("tenant_id", tenant.id)
        .eq("is_homepage", true)
        .eq("status", "published")
        .maybeSingle(),
    ])

  const totalPosts = postsCountResult.count || 0
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const posts = postsResult.data || []
  const homepage = homepageResult.data
  const activeCampaign = activeCampaignsResult.data
  const customHomepage = customHomepageResult.data

  const homepageWidgetPreference = givingSettings?.homepage_widget_preference || "none"
  const showDonorNames = givingSettings?.show_donor_names ?? false
  const targetGoal = givingSettings?.fundraising_target_goal || 5000

  const showGivingWidget = homepageWidgetPreference === "giving"
  const showCampaignWidget = homepageWidgetPreference === "campaign" && activeCampaign
  const showAnyWidget = showGivingWidget || showCampaignWidget

  const widgetData = showAnyWidget
    ? await (async () => {
        if (showCampaignWidget && activeCampaign) {
          const [donationsResult, donationCountResult] = await Promise.all([
            adminClient
              .from("campaign_donations")
              .select("donation_id, donations!inner(amount, created_at, supporter_id, supporters(full_name))")
              .eq("campaign_id", activeCampaign.id)
              .order("donations(created_at)", { ascending: false })
              .limit(5),

            adminClient
              .from("campaign_donations")
              .select("donation_id", { count: "exact", head: true })
              .eq("campaign_id", activeCampaign.id),
          ])

          return {
            type: "campaign" as const,
            campaign: activeCampaign,
            recentDonations: donationsResult.data || [],
            donationCount: donationCountResult.count || 0,
          }
        } else {
          const [totalRaised, recentDonors, stats] = await Promise.all([
            getTotalRaised(tenant.id),
            getRecentDonors(tenant.id, 5),
            getGivingStats(tenant.id),
          ])
          return {
            type: "giving" as const,
            totalRaised,
            recentDonors,
            donationCount: stats.supportersCount,
          }
        }
      })()
    : null

  const postsWithAuthors = posts || []

  // Helper function to estimate read time based on excerpt length (rough estimate)
  const estimateReadTime = (excerpt: string | null) => {
    if (!excerpt) return "3 min read"
    const wordCount = excerpt.split(/\s+/).length
    // Assume excerpt is ~10% of full content, average reading speed 200 wpm
    const estimatedFullWordCount = wordCount * 10
    const minutes = Math.max(2, Math.ceil(estimatedFullWordCount / 200))
    return `${minutes} min read`
  }

  const BlogGrid = () => (
    <div className={`space-y-12 ${raleway.variable}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {postsWithAuthors.map((post, index) => {
          const categories =
            post.blog_post_categories?.map((cat: any) => cat.blog_categories?.name).filter(Boolean) || []
          const primaryCategory = categories[0] || "Update"

          return (
            <Link
              key={post.id}
              href={`/${tenantSlug}/blog/${post.slug}`}
              className="group block bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                {post.featured_image_url ? (
                  <Image
                    src={post.featured_image_url || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                    quality={75}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-3">
                {/* Category with red dash */}
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">—</span>
                  <span className="text-red-500 text-sm font-medium font-raleway">
                    {primaryCategory}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 leading-snug text-balance font-raleway group-hover:text-gray-700 transition-colors">
                  {post.title}
                </h2>
                
                {/* Date and read time */}
                <p className="text-sm text-gray-500 font-raleway">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="mx-2">•</span>
                  {estimateReadTime(post.excerpt)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 font-raleway">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 font-raleway bg-transparent border-gray-300 hover:bg-gray-50"
            asChild={currentPage > 1}
            disabled={currentPage === 1}
          >
            {currentPage > 1 ? (
              <Link href={`?page=${currentPage - 1}`} prefetch={false}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </span>
            )}
          </Button>
          <span className="text-sm text-gray-600 px-4 font-raleway">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 font-raleway bg-transparent border-gray-300 hover:bg-gray-50"
            asChild={currentPage < totalPages}
            disabled={currentPage === totalPages}
          >
            {currentPage < totalPages ? (
              <Link href={`?page=${currentPage + 1}`} prefetch={false}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <span>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )

  const baseUrl = `https://${tenant.subdomain}.tektonstable.com`

  if (customHomepage && customHomepage.design_json) {
    return (
      <div className="min-h-screen bg-background">
        <div id="tenant-data" data-tenant-id={tenant.id} style={{ display: "none" }} />
        <OrganizationSchema
          name={tenant.full_name}
          url={baseUrl}
          logo={tenant.profile_image_url}
          description={tenant.bio}
        />
        <PuckPageRender data={customHomepage.design_json} tenantId={tenant.id} />
      </div>
    )
  }

  if (homepage && homepage.page_sections && homepage.page_sections.length > 0) {
    const sortedSections = homepage.page_sections.sort((a, b) => a.order_index - b.order_index)

    return (
      <div className="min-h-screen bg-background">
        <div id="tenant-data" data-tenant-id={tenant.id} style={{ display: "none" }} />
        <OrganizationSchema
          name={tenant.full_name}
          url={baseUrl}
          logo={tenant.profile_image_url}
          description={tenant.bio}
        />
        <div className="relative">
          <div
            className={`max-w-4xl mx-auto px-4 py-12 ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}
          >
            {/* Centered blog grid container */}
            {postsWithAuthors.length > 0 && <BlogGrid />}
          </div>
          {showAnyWidget && widgetData && (
            <>
              {widgetData.type === "campaign" && widgetData.campaign ? (
                <aside className="hidden xl:block fixed right-8 top-32 w-72 z-10">
                  <CampaignWidget
                    campaign={widgetData.campaign}
                    recentDonations={widgetData.recentDonations}
                    donationCount={widgetData.donationCount}
                    showDonorNames={showDonorNames}
                  />
                </aside>
              ) : widgetData.type === "giving" ? (
                <>
                  {/* Desktop: Fixed position widget */}
                  <aside className="hidden xl:block fixed right-8 top-32 w-72 z-10">
                    <GivingWidget
                      subdomain={tenant.subdomain}
                      raisedAmount={widgetData.totalRaised}
                      goalAmount={targetGoal}
                      donationCount={widgetData.donationCount}
                      showDonorNames={showDonorNames}
                      recentDonors={widgetData.recentDonors}
                    />
                  </aside>
                  {/* Mobile: Widget handles its own positioning */}
                  <div className="xl:hidden">
                    <GivingWidget
                      subdomain={tenant.subdomain}
                      raisedAmount={widgetData.totalRaised}
                      goalAmount={targetGoal}
                      donationCount={widgetData.donationCount}
                      showDonorNames={showDonorNames}
                      recentDonors={widgetData.recentDonors}
                    />
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
        {sortedSections.map((section) => (
          <SectionRenderer
            key={section.id}
            template={section.section_templates}
            props={section.props}
            isVisible={section.is_visible}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div id="tenant-data" data-tenant-id={tenant.id} style={{ display: "none" }} />
      <OrganizationSchema
        name={tenant.full_name}
        url={baseUrl}
        logo={tenant.profile_image_url}
        description={tenant.bio}
      />
      <div className="relative flex-1">
        <div
          className={`max-w-4xl mx-auto px-4 py-12 ${montserrat.variable} ${bebasNeue.variable} ${raleway.variable}`}
        >
          {/* Centered blog grid container */}
          {postsWithAuthors.length > 0 && <BlogGrid />}
        </div>
        {showAnyWidget && widgetData && (
          <>
            {widgetData.type === "campaign" && widgetData.campaign ? (
              <aside className="hidden xl:block fixed right-8 top-32 w-72 z-10">
                <CampaignWidget
                  campaign={widgetData.campaign}
                  recentDonations={widgetData.recentDonations}
                  donationCount={widgetData.donationCount}
                  showDonorNames={showDonorNames}
                />
              </aside>
            ) : widgetData.type === "giving" ? (
              <>
                {/* Desktop: Fixed position widget */}
                <aside className="hidden xl:block fixed right-8 top-32 w-72 z-10">
                  <GivingWidget
                    subdomain={tenant.subdomain}
                    raisedAmount={widgetData.totalRaised}
                    goalAmount={targetGoal}
                    donationCount={widgetData.donationCount}
                    showDonorNames={showDonorNames}
                    recentDonors={widgetData.recentDonors}
                  />
                </aside>
                {/* Mobile: Widget handles its own positioning */}
                <div className="xl:hidden">
                  <GivingWidget
                    subdomain={tenant.subdomain}
                    raisedAmount={widgetData.totalRaised}
                    goalAmount={targetGoal}
                    donationCount={widgetData.donationCount}
                    showDonorNames={showDonorNames}
                    recentDonors={widgetData.recentDonors}
                  />
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
      <CollapsibleCTA subdomain={tenant.subdomain} />
    </div>
  )
}
