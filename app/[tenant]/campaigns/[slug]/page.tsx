import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampaignDonationForm } from "@/components/tenant/campaign-donation-form"
import { CampaignDonationsFeed } from "@/components/tenant/campaign-donations-feed"
import { getCampaignBySlug, getCampaignDonations, getCampaignStats } from "@/app/actions/campaigns"
import { Calendar, Target } from "lucide-react"
import Link from "next/link"
import { CampaignCompletionBanner } from "@/components/tenant/campaign-completion-banner"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapRenderer } from "@/components/admin/blog/tiptap-renderer"

async function getTenant(slug: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) return null
  return data
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

  const campaign = await getCampaignBySlug(tenant.id, slug)

  if (!campaign) {
    return { title: "Campaign Not Found" }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"
  const url = `${baseUrl}/${tenantSlug}/campaigns/${campaign.slug}`
  const description = campaign.description?.substring(0, 160) || `Support ${campaign.title}`

  return {
    title: campaign.title,
    description: description,
    openGraph: {
      title: campaign.title,
      description: description,
      url: url,
      siteName: tenant.full_name || "Campaign",
      images: campaign.featured_image_url
        ? [
            {
              url: campaign.featured_image_url,
              width: 1200,
              height: 630,
              alt: campaign.title,
            },
          ]
        : [],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.title,
      description: description,
      images: campaign.featured_image_url ? [campaign.featured_image_url] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>
}) {
  const { tenant: tenantSlug, slug } = await params
  const tenant = await getTenant(tenantSlug)

  if (!tenant) {
    notFound()
  }

  const campaign = await getCampaignBySlug(tenant.id, slug)

  if (!campaign || campaign.status !== "active") {
    notFound()
  }

  const supabase = await createServerClient()
  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("fee_model, suggested_tip_percent")
    .eq("tenant_id", tenant.id)
    .single()

  const feeModel = givingSettings?.fee_model || "donor_tips"
  const suggestedTipPercent = givingSettings?.suggested_tip_percent || 12

  const donations = await getCampaignDonations(campaign.id, 20)
  const stats = await getCampaignStats(campaign.id)

  const progressPercent =
    campaign.goal_amount > 0 ? Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100) : 0

  const daysRemaining = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const formattedStartDate = campaign.start_date
    ? new Date(campaign.start_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: campaign.title,
    description: campaign.description?.replace(/<[^>]*>/g, "").substring(0, 200),
    image: campaign.featured_image_url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${tenantSlug}/campaigns/${campaign.slug}`,
    agent: {
      "@type": "Person",
      name: tenant.full_name,
    },
    amountRaised: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: campaign.current_amount,
    },
    targetAmount: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: campaign.goal_amount,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {campaign.current_amount >= campaign.goal_amount && (
            <div className="mb-8">
              <CampaignCompletionBanner campaign={campaign} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Campaign content (2 columns) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign header */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
                  {campaign.title}
                </h1>

                {/* Campaign metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">{tenant.full_name?.charAt(0) || "M"}</span>
                    </div>
                    <Link href="/" className="font-medium hover:text-foreground transition-colors">
                      {tenant.full_name || tenantSlug}
                    </Link>
                  </div>
                  {formattedStartDate && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedStartDate}</span>
                      </div>
                    </>
                  )}
                  {daysRemaining !== null && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Featured image */}
              {campaign.featured_image_url && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={campaign.featured_image_url || "/placeholder.svg"}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  />
                </div>
              )}

              {/* Campaign description */}
              <div className="prose prose-lg max-w-none">
                {campaign.description ? (
                  <TiptapRenderer content={campaign.description} />
                ) : (
                  <p className="text-muted-foreground">No description provided.</p>
                )}
              </div>

              {/* Recent donations section */}
              {campaign.show_donor_list && donations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>See who has supported this campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CampaignDonationsFeed
                      donations={donations}
                      allowAnonymous={campaign.allow_anonymous}
                      recentLimit={campaign.recent_donations_limit}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column - Donation form (1 column, sticky) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <CampaignDonationForm
                  tenantId={tenant.id}
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  suggestedAmounts={campaign.suggested_amounts || [25, 50, 100, 250, 500]}
                  feeModel={feeModel}
                  suggestedTipPercent={suggestedTipPercent}
                  currentAmount={campaign.current_amount}
                  goalAmount={campaign.goal_amount}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
