import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { refreshStripeAccountStatus } from '@/app/actions/stripe'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function StripeReturnPage() {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Refresh account status
  const status = await refreshStripeAccountStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Payment Setup Complete!</CardTitle>
          <CardDescription className="text-lg mt-2">
            {status.onboardingCompleted 
              ? "You're ready to receive donations"
              : "Please complete verification to start receiving payments"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Account Status:</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${status.chargesEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span>Accept donations: {status.chargesEnabled ? 'Enabled' : 'Pending'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${status.payoutsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <span>Receive payouts: {status.payoutsEnabled ? 'Enabled' : 'Pending'}</span>
              </li>
            </ul>
          </div>

          <Link href="/dashboard">
            <Button size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
