import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

export async function GET() {
  // Send various log types to Sentry
  console.log("[Sentry Test] This is a test log message")
  console.info("[Sentry Test] This is an info message")
  console.warn("[Sentry Test] This is a warning message")

  // Also manually capture a message
  Sentry.captureMessage("Sentry logs test - manual capture", "info")

  // Add breadcrumb
  Sentry.addBreadcrumb({
    category: "test",
    message: "Testing Sentry logs integration",
    level: "info",
  })

  return NextResponse.json({
    success: true,
    message: "Test logs sent to Sentry. Check your Sentry dashboard in a few moments.",
  })
}
