// Instrumentation file - automatically loaded by Next.js
// Note: Sentry integration is disabled in v0 preview environment

export async function register() {
  // Sentry configs only load in production with SENTRY_DSN set
  if (process.env.SENTRY_DSN) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config")
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config")
    }
  }
}

export const onRequestError = async (
  err: unknown,
  request: {
    path: string
  },
  context: {
    routerKind: "Pages Router" | "App Router"
    routePath: string
    routeType: "render" | "route" | "action" | "middleware"
  },
) => {
  // Log error to console (Sentry capture happens via sentry configs if enabled)
  console.error("[Instrumentation] Request error:", {
    error: err,
    path: request.path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
