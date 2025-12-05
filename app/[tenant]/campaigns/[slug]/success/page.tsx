import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CheckCircle, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShareButtons } from "@/components/tenant/share-buttons"

interface PageProps {
  params: Promise<{
    tenant: string
    slug: string
  }>
  searchParams: Promise<{
    session_id?: string
  }>
}

// Explicitly mark as server component with runtime config
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CampaignSuccessPage({ params, searchParams }: PageProps) {
  const { tenant: tenantSubdomain, slug } = await params
  const { session_id } = await searchParams

  if (!session_id) {
    redirect(`/campaigns/${slug}`)
  }

  const supabase = await createServerClient()

  // Get tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, full_name, subdomain")
    .eq("subdomain", tenantSubdomain)
    .single()

  if (!tenant) {
    notFound()
  }

  // Get campaign
  const { data: campaign } = await supabase
    .from("tenant_campaigns")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .single()

  if (!campaign) {
    notFound()
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"}/${tenant.subdomain}/campaigns/${campaign.slug}`
  const shareText = `I just supported ${campaign.title} for ${tenant.full_name}! Join me in making a difference.`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl">Thank You for Your Generosity!</CardTitle>
          <CardDescription className="text-base">
            Your donation to <span className="font-semibold">{campaign.title}</span> has been successfully processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email with your donation receipt shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Your support is making a real difference for {tenant.full_name}'s mission work.
            </p>
          </div>

          {/* Share section */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Help us spread the word
            </h3>
            <p className="text-sm text-muted-foreground">
              Share this campaign with your friends and family to help {tenant.full_name} reach their goal.
            </p>
            <ShareButtons shareUrl={shareUrl} shareText={shareText} campaignTitle={campaign.title} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="default" className="flex-1">
              <Link href={`/campaigns/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="/">View All Campaigns</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
