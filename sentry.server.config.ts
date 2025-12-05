import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  sendDefaultPii: true,

  integrations: [
    Sentry.vercelAIIntegration({
      recordInputs: true,
      recordOutputs: true,
    }),
  ],

  // Filter out health checks and monitoring pings
  ignoreTransactions: ["/api/health", "/api/cron"],
})
