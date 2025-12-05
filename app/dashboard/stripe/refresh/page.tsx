import { redirect } from 'next/navigation'

export default function StripeRefreshPage() {
  // If user needs to refresh onboarding, redirect back to setup
  redirect('/dashboard/stripe/setup')
}
