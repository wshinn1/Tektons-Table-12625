import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get all newsletters for this tenant
  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select(`
      *,
      recipients:newsletter_recipients(count)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching newsletters', { status: 500 })
  }

  // Generate CSV
  const headers = ['Subject', 'Sent Date', 'Recipients', 'Sent', 'Failed', 'Status']
  const rows = newsletters.map(n => [
    n.subject || '',
    n.sent_at ? new Date(n.sent_at).toLocaleDateString() : 'Not sent',
    n.recipient_count || 0,
    n.sent_count || 0,
    n.failed_count || 0,
    n.status
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="newsletters-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
