"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { format } from "date-fns"
import {
  Crown,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gift,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PREMIUM_RESOURCES_AMOUNT } from "@/lib/stripe-premium"

interface SubscriptionDashboardProps {
  user: User
  subscription: {
    id: string
    status: string
    stripe_subscription_id: string | null
    stripe_customer_id: string | null
    current_period_start: string | null
    current_period_end: string | null
    grace_period_end: string | null
    is_tenant_trial: boolean
    trial_end_date: string | null
    canceled_at: string | null
  } | null
  compedAccess: {
    id: string
    reason: string | null
    starts_at: string
    expires_at: string | null
  } | null
  tenant: {
    id: string
    full_name: string
    premium_trial_ends_at: string | null
    premium_trial_used: boolean
  } | null
}

export function SubscriptionDashboard({ user, subscription, compedAccess, tenant }: SubscriptionDashboardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setIsLoading("subscribe")
    try {
      const response = await fetch("/api/premium/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/account/subscription?success=true`,
          cancelUrl: `${window.location.origin}/account/subscription`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setIsLoading("portal")
    try {
      const response = await fetch("/api/premium/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/account/subscription`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusBadge = () => {
    if (compedAccess) {
      return <Badge className="bg-purple-500 hover:bg-purple-600">Complimentary Access</Badge>
    }

    if (!subscription) {
      return <Badge variant="secondary">No Subscription</Badge>
    }

    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "trialing":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Free Trial</Badge>
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="secondary">Inactive</Badge>
    }
  }

  const hasAccess = () => {
    if (compedAccess) return true
    if (!subscription) return false

    if (["active", "trialing"].includes(subscription.status)) return true
    if (subscription.status === "canceled" && subscription.current_period_end) {
      return new Date(subscription.current_period_end) > new Date()
    }
    if (subscription.status === "past_due" && subscription.grace_period_end) {
      return new Date(subscription.grace_period_end) > new Date()
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Premium Resources</CardTitle>
                <CardDescription>${(PREMIUM_RESOURCES_AMOUNT / 100).toFixed(2)}/month</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Access Status */}
          {hasAccess() ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-400">You have full access</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-500">
                Enjoy unlimited access to all premium resources and articles.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertTitle>Unlock Premium Resources</AlertTitle>
              <AlertDescription>
                Subscribe to access 150,000+ words of fundraising guides, ministry resources, and expert articles.
              </AlertDescription>
            </Alert>
          )}

          {/* Comped Access Info */}
          {compedAccess && (
            <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-400">Complimentary Access</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-500">
                {compedAccess.reason || "You have been granted free access to Premium Resources."}
              </p>
              {compedAccess.expires_at && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                  Access expires: {format(new Date(compedAccess.expires_at), "MMMM d, yyyy")}
                </p>
              )}
            </div>
          )}

          {/* Past Due Warning */}
          {subscription?.status === "past_due" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Your last payment was unsuccessful. Please update your payment method to continue accessing premium
                  content.
                </p>
                {subscription.grace_period_end && (
                  <p className="font-medium">
                    Access expires: {format(new Date(subscription.grace_period_end), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Trial Info */}
          {subscription?.status === "trialing" && subscription.trial_end_date && (
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-400">Free Trial Active</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-500">
                Your free trial ends on {format(new Date(subscription.trial_end_date), "MMMM d, yyyy")}. You will be
                charged ${(PREMIUM_RESOURCES_AMOUNT / 100).toFixed(2)}/month after the trial ends.
              </p>
            </div>
          )}

          {/* Canceled but still has access */}
          {subscription?.status === "canceled" &&
            subscription.current_period_end &&
            new Date(subscription.current_period_end) > new Date() && (
              <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-400">Subscription Ending</span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Your subscription was canceled but you still have access until{" "}
                  {format(new Date(subscription.current_period_end), "MMMM d, yyyy")}.
                </p>
              </div>
            )}

          <Separator />

          {/* Billing Details */}
          {subscription && subscription.status !== "inactive" && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing Details
              </h4>
              <div className="grid gap-2 text-sm">
                {subscription.current_period_start && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current period started</span>
                    <span>{format(new Date(subscription.current_period_start), "MMM d, yyyy")}</span>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span>{format(new Date(subscription.current_period_end), "MMM d, yyyy")}</span>
                  </div>
                )}
                {subscription.canceled_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Canceled on</span>
                    <span>{format(new Date(subscription.canceled_at), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tenant Trial Info (if they haven't subscribed yet) */}
          {tenant && !subscription && !tenant.premium_trial_used && (
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">Tenant Benefit Available</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-500">
                As a Tekton's Table ministry, you're eligible for a free 30-day trial of Premium Resources!
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          {!subscription || subscription.status === "inactive" || subscription.status === "expired" ? (
            <Button onClick={handleSubscribe} disabled={isLoading === "subscribe"} className="w-full sm:w-auto">
              {isLoading === "subscribe" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </Button>
          ) : subscription.status === "canceled" ? (
            <Button onClick={handleSubscribe} disabled={isLoading === "subscribe"} className="w-full sm:w-auto">
              {isLoading === "subscribe" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resubscribe
                </>
              )}
            </Button>
          ) : null}

          {subscription?.stripe_customer_id && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={isLoading === "portal"}
              className="w-full sm:w-auto bg-transparent"
            >
              {isLoading === "portal" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              "Access to all premium resources and articles",
              "150,000+ words of fundraising guides",
              "Ministry leadership content",
              "Donor communication templates",
              "New resources added monthly",
              "Cancel anytime",
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Need Help Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Have questions about your subscription?{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact our support team
            </a>{" "}
            and we'll be happy to help.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
