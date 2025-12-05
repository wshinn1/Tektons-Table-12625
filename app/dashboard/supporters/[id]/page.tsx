import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AddSupporterNote } from '@/components/supporters/add-note'

export default async function SupporterDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get supporter details
  const { data: supporter } = await supabase
    .from('supporter_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('tenant_id', user.id)
    .single()

  if (!supporter) {
    redirect('/dashboard/supporters')
  }

  // Get donation history
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('supporter_email', supporter.email)
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  // Get notes
  const { data: notes } = await supabase
    .from('supporter_notes')
    .select('*')
    .eq('supporter_id', supporter.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{supporter.full_name || supporter.email}</h1>
        <p className="text-muted-foreground">{supporter.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${parseFloat(supporter.total_donated || '0').toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{donations?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{new Date(supporter.created_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            {donations && donations.length > 0 ? (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">${parseFloat(donation.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={donation.status === 'succeeded' ? 'default' : 'secondary'}>
                      {donation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No donations yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Add notes about this supporter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddSupporterNote supporterId={supporter.id} tenantId={user.id} />
            
            {notes && notes.length > 0 ? (
              <div className="space-y-3 mt-4">
                {notes.map((note) => (
                  <div key={note.id} className="border-b pb-2">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No notes yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
