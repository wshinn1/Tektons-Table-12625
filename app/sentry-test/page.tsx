"use client"

import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SentryTestPage() {
  const triggerError = () => {
    // Trigger a test error
    throw new Error("[TEST] Sentry integration test - this is intentional")
  }

  const captureException = () => {
    // Manually capture an exception
    Sentry.captureException(new Error("[TEST] Manual Sentry test exception"))
    alert("Test exception sent to Sentry! Check your dashboard in 1-2 minutes.")
  }

  const captureMessage = () => {
    // Send a test message
    Sentry.captureMessage("[TEST] Sentry message test - everything is working!", "info")
    alert("Test message sent to Sentry! Check your dashboard in 1-2 minutes.")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold">Sentry Integration Test</h1>
        <p className="mb-8 text-muted-foreground">
          Use these buttons to test your Sentry integration. Errors should appear in your Sentry dashboard within 1-2
          minutes.
        </p>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-2 text-xl font-semibold">Test 1: Throw Error</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This will trigger an unhandled error that should be caught by Sentry's error boundary.
            </p>
            <Button onClick={triggerError} variant="destructive">
              Trigger Test Error
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 text-xl font-semibold">Test 2: Capture Exception</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This will manually send an exception to Sentry without throwing an error.
            </p>
            <Button onClick={captureException}>Send Test Exception</Button>
          </Card>

          <Card className="p-6">
            <h2 className="mb-2 text-xl font-semibold">Test 3: Capture Message</h2>
            <p className="mb-4 text-sm text-muted-foreground">This will send an informational message to Sentry.</p>
            <Button onClick={captureMessage}>Send Test Message</Button>
          </Card>
        </div>

        <div className="mt-8 rounded-lg border bg-muted/50 p-4">
          <h3 className="mb-2 font-semibold">How to Verify:</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Click any test button above</li>
            <li>Wait 1-2 minutes for events to process</li>
            <li>Check your Sentry dashboard at sentry.io</li>
            <li>Look in Issues tab for [TEST] prefixed errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
