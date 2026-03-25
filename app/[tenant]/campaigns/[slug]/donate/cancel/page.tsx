import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    tenant: string
    slug: string
  }>
}

export default async function DonationCancelPage({ params }: PageProps) {
  const { tenant: tenantSubdomain, slug } = await params

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
            <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <CardTitle className="text-3xl">Donation Cancelled</CardTitle>
          <CardDescription className="text-lg">
            Your donation to <span className="font-semibold">{campaign.title}</span> was not completed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              No charges have been made to your payment method. If you experienced any issues or have questions, please
              contact support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/${tenantSubdomain}/campaigns/${slug}/donate`} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">Try Again</Button>
            </Link>
            <Link href={`/${tenantSubdomain}/campaigns/${slug}`} className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
