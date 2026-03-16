import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, Share2 } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    tenant: string
    slug: string
  }>
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function DonationSuccessPage({ params, searchParams }: PageProps) {
  const { tenant: tenantSubdomain, slug } = await params
  const { session_id } = await searchParams

  if (!session_id) {
    redirect(`/${tenantSubdomain}/campaigns/${slug}`)
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl">Thank You for Your Donation!</CardTitle>
          <CardDescription className="text-lg">
            Your support for <span className="font-semibold">{campaign.title}</span> has been received successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>A receipt has been sent to your email address</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Your donation is helping {tenant.full_name} reach their goal</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You can view your donation history in your account</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/${tenantSubdomain}/campaigns/${slug}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
            <Link href={`/${tenantSubdomain}`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">View All Campaigns</Button>
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Help spread the word!</p>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share This Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
