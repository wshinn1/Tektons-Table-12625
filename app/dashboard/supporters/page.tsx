import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function SupportersPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get supporters for this tenant
  const { data: supporters } = await supabase
    .from('supporter_profiles')
    .select('*')
    .eq('tenant_id', user.id)
    .order('total_donated', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supporters</h1>
          <p className="text-muted-foreground">Manage your supporter relationships</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Supporters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{supporters?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {supporters?.filter(s => {
                const lastDonation = new Date(s.last_donation_date)
                const monthAgo = new Date()
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                return lastDonation > monthAgo
              }).length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${supporters?.reduce((sum, s) => sum + parseFloat(s.total_donated || '0'), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Supporters</CardTitle>
          <CardDescription>View and manage your supporter base</CardDescription>
        </CardHeader>
        <CardContent>
          {supporters && supporters.length > 0 ? (
            <div className="space-y-4">
              {supporters.map((supporter) => (
                <div key={supporter.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-semibold">{supporter.full_name || supporter.email}</p>
                    <p className="text-sm text-muted-foreground">{supporter.email}</p>
                    {supporter.last_donation_date && (
                      <p className="text-xs text-muted-foreground">
                        Last donation: {new Date(supporter.last_donation_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-lg">
                      ${parseFloat(supporter.total_donated || '0').toFixed(2)}
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/supporters/${supporter.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No supporters yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
