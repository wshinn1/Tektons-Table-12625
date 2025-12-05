'use server';

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function exportSupporters() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Get all supporters for this tenant
  const { data: supporters, error } = await supabase
    .from('supporter_profiles')
    .select('*')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convert to CSV format
  const headers = ['Name', 'Email', 'Total Donated', 'Donation Count', 'Last Donation', 'Created At'];
  const rows = supporters.map(s => [
    s.full_name,
    s.email,
    s.total_donated || 0,
    s.donation_count || 0,
    s.last_donation_at || 'Never',
    new Date(s.created_at).toLocaleDateString()
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return { csv, filename: `supporters-${Date.now()}.csv` };
}

export async function exportDonations() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Get all donations for this tenant
  const { data: donations, error } = await supabase
    .from('donations')
    .select(`
      *,
      supporter_profiles(full_name, email)
    `)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convert to CSV format (QuickBooks compatible)
  const headers = [
    'Date',
    'Customer',
    'Email',
    'Amount',
    'Currency',
    'Type',
    'Stripe Fee',
    'Platform Fee',
    'Net Amount',
    'Transaction ID'
  ];
  
  const rows = donations.map(d => [
    new Date(d.created_at).toLocaleDateString(),
    d.supporter_profiles?.full_name || 'Anonymous',
    d.supporter_profiles?.email || '',
    (d.amount / 100).toFixed(2),
    d.currency.toUpperCase(),
    d.recurring ? 'Recurring' : 'One-time',
    ((d.stripe_fee || 0) / 100).toFixed(2),
    ((d.platform_fee || 0) / 100).toFixed(2),
    ((d.amount - (d.stripe_fee || 0) - (d.platform_fee || 0)) / 100).toFixed(2),
    d.stripe_payment_intent_id
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return { csv, filename: `donations-${Date.now()}.csv` };
}
