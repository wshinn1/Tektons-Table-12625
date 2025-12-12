import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  sendDefaultPii: true,

  spotlight: process.env.NODE_ENV === "development",

  integrations: [
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
    Sentry.captureConsoleIntegration({
      levels: ["log", "info", "warn", "error", "debug", "assert"],
    }),
  ],

  // Filter out health checks and monitoring pings
  ignoreTransactions: ["/api/health", "/api/cron"],
})
