import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  spotlight: process.env.NODE_ENV === "development",

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.captureConsoleIntegration({
      levels: ["log", "info", "warn", "error", "debug", "assert"],
    }),
  ],

  // Filter out certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Facebook blocked
    "fb_xd_fragment",
    // ISP optimizing
    "bmi_SafeAddOnload",
    // Chrome extensions
    "chrome-extension",
    "moz-extension",
  ],

  telemetry: false,

  beforeSend(event, hint) {
    return event
  },
})
