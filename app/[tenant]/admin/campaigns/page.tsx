import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/donation-tiers"
import { getAllCampaigns, getCampaignStats } from "@/app/actions/campaigns"

export default async function CampaignsAdminPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: subdomain } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${subdomain}/auth/login`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", subdomain).single()

  if (!tenant || tenant.email !== user.email) {
    redirect(`/${subdomain}`)
  }

  // Fetch all campaigns and stats
  const campaigns = await getAllCampaigns(tenant.id)
  const stats = await getCampaignStats(tenant.id)

  const activeCampaigns = campaigns?.filter((c) => c.status === "active") || []
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.current_amount || 0), 0) || 0
  const totalGoal = campaigns?.reduce((sum, c) => sum + c.goal_amount, 0) || 0
  const avgDonation = stats?.avgDonation || 0

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-500">Paused</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <p className="text-muted-foreground mt-2">Create and manage fundraising campaigns for specific goals</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRaised * 100)}</div>
            <p className="text-xs text-muted-foreground mt-1">of {formatCurrency(totalGoal * 100)} goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">of {campaigns?.length || 0} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDonations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgDonation * 100)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {!campaigns || campaigns.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first campaign to start raising funds for specific goals
            </p>
            <Link href="/admin/campaigns/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const progress =
              campaign.goal_amount > 0 ? Math.round((campaign.current_amount / campaign.goal_amount) * 100) : 0

            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{campaign.title}</CardTitle>
                        {getStatusBadge(campaign.status)}
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {campaign.description.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/campaigns/${campaign.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">{formatCurrency(campaign.current_amount * 100)} raised</span>
                        <span className="text-muted-foreground">{formatCurrency(campaign.goal_amount * 100)} goal</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
                    </div>

                    {/* Campaign Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Donations: </span>
                        <span className="font-medium">{campaign.donation_count || 0}</span>
                      </div>
                      {campaign.end_date && (
                        <div>
                          <span className="text-muted-foreground">Ends: </span>
                          <span className="font-medium">{new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {campaign.show_in_menu && (
                        <Badge variant="outline" className="text-xs">
                          In Menu
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Link href={`/campaigns/${campaign.slug}`}>
                        <Button variant="link" size="sm">
                          View Public Page
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
