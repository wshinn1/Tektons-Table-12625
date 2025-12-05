import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, MousePointerClick, MailWarning, MailCheck } from 'lucide-react'

export default async function NewsletterAnalyticsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch newsletter
  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', user.id)
    .single()

  if (!newsletter) redirect('/dashboard/newsletters')

  // Fetch recipients
  const { data: recipients } = await supabase
    .from('newsletter_recipients')
    .select('*')
    .eq('newsletter_id', params.id)

  // Fetch analytics
  const { data: analytics } = await supabase
    .from('newsletter_analytics')
    .select('*')
    .eq('newsletter_id', params.id)

  const totalSent = recipients?.filter(r => r.status === 'sent').length || 0
  const totalFailed = recipients?.filter(r => r.status === 'failed').length || 0
  const totalOpened = analytics?.filter(a => a.event_type === 'opened').length || 0
  const totalClicked = analytics?.filter(a => a.event_type === 'clicked').length || 0

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0'

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">{newsletter.subject}</h1>
      <p className="text-muted-foreground mb-6">
        Sent on {new Date(newsletter.sent_at).toLocaleDateString()}
      </p>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <MailCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpened}</div>
            <p className="text-xs text-muted-foreground">{openRate}% open rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicked</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicked}</div>
            <p className="text-xs text-muted-foreground">{clickRate}% click rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <MailWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFailed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recipients?.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span>{recipient.email}</span>
                <span className="text-sm text-muted-foreground capitalize">{recipient.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
