// Instrumentation file for Next.js
// Sentry integration is disabled in v0 preview - enable on production by uncommenting

export async function register() {
  // Sentry configs would be loaded here in production
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  //   await import("./sentry.server.config")
  // }
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("./sentry.edge.config")
  // }
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
  // Log errors to console (Sentry disabled in v0 preview)
  console.error("[Instrumentation] Request error:", {
    error: err,
    path: request.path,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
