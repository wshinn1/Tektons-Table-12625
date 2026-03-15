// Instrumentation file for Sentry - automatically loaded by Next.js
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
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
  // Only use Sentry if it's available (skip in v0 preview)
  try {
    const Sentry = await import("@sentry/nextjs")
    Sentry.captureException(err, {
      contexts: {
        nextjs: {
          request_path: request.path,
          router_kind: context.routerKind,
          router_path: context.routePath,
          route_type: context.routeType,
        },
      },
    })
  } catch {
    // Sentry not available, log error to console instead
    console.error("[Instrumentation] Error captured:", err)
  }
}
