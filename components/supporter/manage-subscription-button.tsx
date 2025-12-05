"use client"

import { Button } from "@/components/ui/button"

export function ManageSubscriptionButton({
  subscriptionId,
  stripeAccountId,
}: {
  subscriptionId: string
  stripeAccountId?: string
}) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // Link to Stripe Customer Portal for the specific tenant's Stripe account
        if (stripeAccountId) {
          window.open(
            `/api/stripe/customer-portal?subscription_id=${subscriptionId}&account=${stripeAccountId}`,
            "_blank",
          )
        }
      }}
    >
      Manage
    </Button>
  )
}
