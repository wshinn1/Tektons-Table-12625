"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

    if (dsn && !Sentry.getClient()) {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        beforeSend(event) {
          // Filter out browser extension errors
          if (
            event.exception?.values?.[0]?.stacktrace?.frames?.some(
              (frame) =>
                frame.filename?.includes("chrome-extension://") || frame.filename?.includes("moz-extension://"),
            )
          ) {
            return null
          }
          return event
        },
      })
    }
  }, [])

  return null
}
