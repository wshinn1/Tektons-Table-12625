"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react"
import { generatePlatformStripeConnectUrl, disconnectPlatformStripe } from "@/app/actions/platform-stripe"

interface PlatformStripeConnectCardProps {
  connected: boolean
  accountId?: string | null
  accountEmail?: string | null
  connectedAt?: string | null
}

export function PlatformStripeConnectCard({
  connected,
  accountId,
  accountEmail,
  connectedAt,
}: PlatformStripeConnectCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      const url = await generatePlatformStripeConnectUrl()
      window.location.href = url
    } catch (error) {
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to connect Stripe",
      })
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect your Stripe account? This will prevent you from receiving platform fees.",
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      await disconnectPlatformStripe()
      setAlert({ type: "success", message: "Stripe account disconnected successfully" })
      window.location.reload()
    } catch (error) {
      setAlert({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to disconnect Stripe",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <svg className="h-8 w-20" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#635BFF"
              d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z"
            />
          </svg>
        </div>
        <CardTitle>Platform Stripe Account</CardTitle>
        <CardDescription>
          Connect your Stripe account to receive platform fees and tips from tenant donations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">Connected to Stripe</span>
            </div>

            {accountId && (
              <div className="text-sm text-muted-foreground">
                Account ID: <code className="text-xs bg-muted px-2 py-1 rounded">{accountId}</code>
              </div>
            )}

            {connectedAt && (
              <div className="text-sm text-muted-foreground">
                Connected on {new Date(connectedAt).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open("https://dashboard.stripe.com", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You need to connect your Stripe account to receive platform fees and tips from donations made on tenant
              sites.
            </p>
            <Button onClick={handleConnect} disabled={isLoading} className="bg-[#635BFF] hover:bg-[#5248E5]">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Connect with Stripe
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
