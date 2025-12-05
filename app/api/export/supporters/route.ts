import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get all supporters for this tenant
  const { data: supporters, error } = await supabase
    .from('supporter_profiles')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching supporters', { status: 500 })
  }

  // Generate CSV
  const headers = ['Name', 'Email', 'Language', 'Total Donated', 'Donation Count', 'Last Donation', 'Subscribed', 'Created At']
  const rows = supporters.map(s => [
    s.full_name || '',
    s.email || '',
    s.language_preference || 'en',
    s.total_donated || '0',
    s.donation_count || '0',
    s.last_donation_at || '',
    s.email_notifications_enabled ? 'Yes' : 'No',
    s.created_at
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="supporters-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
