import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Target, Calendar, TrendingUp } from 'lucide-react'

export default async function CampaignsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || []
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed') || []
  const totalRaised = campaigns?.reduce((sum, c) => sum + parseFloat(c.current_amount || 0), 0) || 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage fundraising campaigns</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRaised.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">Create your first campaign to start fundraising</p>
              <Button asChild>
                <Link href="/dashboard/campaigns/new">Create Campaign</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns?.map((campaign) => {
            const progress = (parseFloat(campaign.current_amount) / parseFloat(campaign.goal_amount)) * 100
            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{campaign.title}</CardTitle>
                        <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'completed' ? 'secondary' : 'outline'}>
                          {campaign.status}
                        </Badge>
                        {campaign.is_featured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                      </div>
                      <CardDescription>{campaign.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">${parseFloat(campaign.current_amount).toFixed(2)} raised</span>
                      <span className="text-muted-foreground">Goal: ${parseFloat(campaign.goal_amount).toFixed(2)}</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress.toFixed(1)}% complete</span>
                      {campaign.end_date && (
                        <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
