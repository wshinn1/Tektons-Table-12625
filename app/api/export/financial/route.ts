import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all donations for financial summary
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse('Error fetching donations', { status: 500 })
  }

  // Calculate totals
  const totalGross = donations.reduce((sum, d) => sum + d.amount, 0)
  const totalPlatformFees = donations.reduce((sum, d) => sum + d.platform_fee_amount, 0)
  const totalStripeFees = donations.reduce((sum, d) => sum + d.stripe_fee_amount, 0)
  const totalNet = totalGross - totalPlatformFees - totalStripeFees

  // Generate financial summary CSV
  const headers = [
    'Metric',
    'Amount (USD)',
    'Percentage'
  ]
  
  const rows = [
    ['Total Donations Received', (totalGross / 100).toFixed(2), '100%'],
    ['Platform Fees', (totalPlatformFees / 100).toFixed(2), ((totalPlatformFees / totalGross) * 100).toFixed(2) + '%'],
    ['Stripe Processing Fees', (totalStripeFees / 100).toFixed(2), ((totalStripeFees / totalGross) * 100).toFixed(2) + '%'],
    ['Net Amount to Missionary', (totalNet / 100).toFixed(2), ((totalNet / totalGross) * 100).toFixed(2) + '%'],
    ['', '', ''],
    ['Missionary Name', tenant?.full_name || '', ''],
    ['Report Generated', new Date().toLocaleDateString(), ''],
    ['Total Transactions', donations.length.toString(), '']
  ]

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="financial-summary-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
