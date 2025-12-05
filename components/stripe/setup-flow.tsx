'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'
import { createStripeConnectAccount, createStripeOnboardingLink } from '@/app/actions/stripe'
import { useRouter } from 'next/navigation'

export function StripeSetupFlow({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleStartOnboarding() {
    try {
      setLoading(true)

      // Create Stripe account if needed
      if (!tenant.stripe_account_id) {
        await createStripeConnectAccount()
      }

      // Get onboarding link
      const { url } = await createStripeOnboardingLink()
      
      // Redirect to Stripe onboarding
      window.location.href = url
    } catch (error) {
      console.error('[v0] Stripe setup error:', error)
      alert('Failed to start Stripe setup. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold">Set Up Payments</CardTitle>
        <CardDescription className="text-lg mt-2">
          Connect your bank account to receive donations from supporters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Personal information (name, date of birth, address)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Bank account details for receiving payouts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Tax ID (SSN or EIN)</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Tektons Table uses Stripe to securely process payments and transfer funds to your bank account.
          </p>
          <p>
            You'll be redirected to Stripe to complete a quick verification process. This typically takes 5-10 minutes.
          </p>
          <p className="font-medium text-foreground">
            Platform fee: {tenant.platform_fee_percentage}% per donation
          </p>
        </div>

        <Button 
          onClick={handleStartOnboarding}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Starting setup...
            </>
          ) : (
            'Connect with Stripe'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to Stripe's Terms of Service
        </p>
      </CardContent>
    </Card>
  )
}
