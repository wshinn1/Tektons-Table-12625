import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Send, Eye, Clock, CheckCircle } from 'lucide-react'

export default async function NewslettersPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch newsletters
  const { data: newsletters } = await supabase
    .from('newsletters')
    .select(`
      *,
      newsletter_recipients(count),
      newsletter_analytics(count)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Newsletters</h1>
          <p className="text-muted-foreground">Send standalone email updates to your supporters</p>
        </div>
        <Link href="/dashboard/newsletters/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Newsletter
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {newsletters && newsletters.length > 0 ? (
          newsletters.map((newsletter) => (
            <Card key={newsletter.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{newsletter.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {getStatusBadge(newsletter.status)}
                      <span className="ml-2">
                        {new Date(newsletter.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {newsletter.status === 'draft' && (
                      <Link href={`/dashboard/newsletters/${newsletter.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    )}
                    {newsletter.status === 'sent' && (
                      <Link href={`/dashboard/newsletters/${newsletter.id}/analytics`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>{newsletter.sent_count || 0} sent</span>
                  </div>
                  {newsletter.scheduled_for && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Scheduled: {new Date(newsletter.scheduled_for).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>Segment: {getSegmentLabel(newsletter.segment)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No newsletters yet</p>
              <Link href="/dashboard/newsletters/new">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Newsletter
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function getStatusBadge(status: string) {
  const variants = {
    draft: { label: 'Draft', variant: 'secondary' as const },
    scheduled: { label: 'Scheduled', variant: 'default' as const },
    sending: { label: 'Sending', variant: 'default' as const },
    sent: { label: 'Sent', variant: 'default' as const },
    failed: { label: 'Failed', variant: 'destructive' as const },
  }

  const config = variants[status as keyof typeof variants] || variants.draft

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function getSegmentLabel(segment: string) {
  const labels = {
    all: 'All Supporters',
    monthly_donors: 'Monthly Donors',
    new_supporters: 'New Supporters',
    one_time_donors: 'One-Time Donors',
    custom: 'Custom Segment',
  }

  return labels[segment as keyof typeof labels] || segment
}
