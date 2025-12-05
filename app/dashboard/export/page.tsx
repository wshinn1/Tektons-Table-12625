import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'

export default async function ExportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/auth/login')
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (!tenant) redirect('/onboarding')

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground">Download your data for accounting, reporting, or backup purposes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supporters</CardTitle>
            <CardDescription>Export your supporter list with contact information and giving history</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/export/supporters" method="POST">
              <Button type="submit" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Supporters CSV
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donations</CardTitle>
            <CardDescription>Export donation transactions for QuickBooks or tax reporting</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/export/donations" method="POST">
              <Button type="submit" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Donations CSV
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Newsletter Analytics</CardTitle>
            <CardDescription>Export email campaign performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/export/newsletters" method="POST">
              <Button type="submit" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Analytics CSV
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>QuickBooks-compatible IIF format for accounting integration</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/export/financial" method="POST">
              <Button type="submit" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Financial Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>QuickBooks Integration</CardTitle>
          <CardDescription>Learn how to sync your Tektons Table data with QuickBooks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Option 1: Stripe Dashboard (Recommended)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Stripe provides direct integration with QuickBooks through their dashboard. This is the easiest method.
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Log into your Stripe Dashboard</li>
              <li>Go to Settings → Connected accounts</li>
              <li>Click "Connect to QuickBooks"</li>
              <li>Authorize the connection</li>
              <li>Transactions sync automatically</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Option 2: Manual CSV Import</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Download donation CSV above and import into QuickBooks manually.
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Click "Download Donations CSV" above</li>
              <li>Open QuickBooks Desktop or Online</li>
              <li>Go to File → Import → IIF or Excel</li>
              <li>Select the downloaded file</li>
              <li>Map fields and import</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
