"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

// Use environment variable for main site URL, fallback to tektonstable.com for production
const MAIN_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tektonstable.com"

export function SessionSyncPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)

  useEffect(() => {
    // Check if there's a session on the main domain
    const checkMainSession = async () => {
      try {
        const response = await fetch(`${MAIN_SITE_URL}/api/auth/check-main-session`, {
          credentials: "include",
        })
        const data = await response.json()

        if (data.hasSession) {
          setShowPrompt(true)
        }
      } catch (error) {
        console.error("[v0] Failed to check main session:", error)
      }
    }

    checkMainSession()
  }, [])

  const handleTransfer = async () => {
    setIsTransferring(true)
    try {
      const response = await fetch(`${MAIN_SITE_URL}/api/auth/check-main-session`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.hasSession) {
        // Transfer the session to this subdomain
        const transferResponse = await fetch("/api/auth/transfer-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          }),
        })

        if (transferResponse.ok) {
          // Reload the page to apply the new session
          window.location.reload()
        } else {
          console.error("[v0] Session transfer failed")
          setIsTransferring(false)
        }
      }
    } catch (error) {
      console.error("[v0] Session transfer error:", error)
      setIsTransferring(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Your Session
          </CardTitle>
          <CardDescription>
            We detected you're logged in on the main site. Would you like to sync your session to this page?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleTransfer} disabled={isTransferring} className="flex-1">
            {isTransferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isTransferring ? "Syncing..." : "Yes, Sync Session"}
          </Button>
          <Button variant="outline" onClick={() => setShowPrompt(false)} disabled={isTransferring} className="flex-1">
            Not Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
