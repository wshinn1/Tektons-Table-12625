import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,
  debug: false,

  spotlight: process.env.NODE_ENV === "development",

  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["log", "info", "warn", "error", "debug", "assert"],
    }),
  ],
})
