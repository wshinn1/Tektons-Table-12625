import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  const refCode = searchParams.ref

  let referrer = null
  if (refCode) {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('referral_codes')
      .select('tenant_id, tenants(full_name, bio)')
      .eq('code', refCode)
      .single()
    
    referrer = data
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-16">
        {/* Header */}
        <div className="text-center mb-12">
          {referrer ? (
            <>
              <h1 className="text-4xl font-bold mb-4">
                Join {referrer.tenants.full_name} on Tektons Table
              </h1>
              <p className="text-xl text-muted-foreground">
                You've been invited to the missionary fundraising platform
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4">
                Join Tektons Table
              </h1>
              <p className="text-xl text-muted-foreground">
                The all-in-one fundraising platform for missionaries
              </p>
            </>
          )}
        </div>

        {/* Welcome Discount Banner */}
        <Card className="mb-8 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Discount</CardTitle>
            <CardDescription className="text-lg">
              Get your first 30 days at 2.5% platform fee (save 28.5%!)
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>All-in-One Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Custom fundraising page</li>
                <li>• Email newsletters (FREE!)</li>
                <li>• Supporter CRM</li>
                <li>• Content management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Save Money</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• No monthly subscription fees</li>
                <li>• Save $1,620-3,072 per year</li>
                <li>• Lower fees through referrals</li>
                <li>• Global currency support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Raise More</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Automated email campaigns</li>
                <li>• Support tier management</li>
                <li>• Locked content for supporters</li>
                <li>• Analytics and tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Global Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 6 languages supported</li>
                <li>• 135+ currencies</li>
                <li>• International payments</li>
                <li>• Multi-language emails</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href={`/auth/signup${refCode ? `?ref=${refCode}` : ''}`}>
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • 2.5% platform fee for first 30 days
          </p>
        </div>
      </div>
    </div>
  )
}
