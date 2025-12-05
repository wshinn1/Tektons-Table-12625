import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get all donations for this tenant
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      supporter:supporter_profiles(full_name, email)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching donations', { status: 500 })
  }

  // Generate CSV in QuickBooks-compatible format
  const headers = [
    'Date',
    'Donor Name',
    'Donor Email',
    'Amount',
    'Currency',
    'Platform Fee',
    'Stripe Fee',
    'Net Amount',
    'Recurring',
    'Status',
    'Stripe Payment ID'
  ]
  
  const rows = donations.map(d => [
    new Date(d.created_at).toLocaleDateString(),
    d.supporter?.full_name || 'Anonymous',
    d.supporter?.email || '',
    (d.amount / 100).toFixed(2),
    d.currency || 'USD',
    (d.platform_fee_amount / 100).toFixed(2),
    (d.stripe_fee_amount / 100).toFixed(2),
    ((d.amount - d.platform_fee_amount - d.stripe_fee_amount) / 100).toFixed(2),
    d.recurring ? 'Yes' : 'No',
    d.status,
    d.stripe_payment_intent_id || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="donations-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
