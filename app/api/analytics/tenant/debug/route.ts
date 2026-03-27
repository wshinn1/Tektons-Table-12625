import { NextRequest, NextResponse } from "next/server"

const POSTHOG_API_URL = "https://app.posthog.com"

async function runHogQLQuery(sql: string) {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !apiKey) {
    throw new Error("Missing PostHog configuration")
  }

  const res = await fetch(`${POSTHOG_API_URL}/api/projects/${projectId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query: sql } }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PostHog API error ${res.status}: ${error}`)
  }

  return res.json()
}

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get("subdomain") ?? ""
  const tenantHost = `${subdomain}.tektonstable.com`

  try {
    const [
      totalEvents,
      totalPageviews,
      recentHosts,
      recentUrls,
      hostFilterCount,
      urlFilterCount,
      tenantPropCount,
      veryRecentEvents,
      veryRecentHosts,
    ] = await Promise.all([
      runHogQLQuery(`SELECT count() FROM events WHERE timestamp > now() - INTERVAL 30 DAY`),
      runHogQLQuery(`SELECT count() FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY`),
      runHogQLQuery(
        `SELECT properties.$host, count() as n FROM events
         WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
         GROUP BY properties.$host ORDER BY n DESC LIMIT 20`
      ),
      runHogQLQuery(
        `SELECT properties.$current_url, properties.$host, properties.tenant, timestamp FROM events
         WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY
         ORDER BY timestamp DESC LIMIT 10`
      ),
      runHogQLQuery(
        `SELECT count() FROM events
         WHERE event = '$pageview' AND properties.$host = '${tenantHost}'
         AND timestamp > now() - INTERVAL 30 DAY`
      ),
      runHogQLQuery(
        `SELECT count() FROM events
         WHERE event = '$pageview' AND properties.$current_url LIKE '%${tenantHost}%'
         AND timestamp > now() - INTERVAL 30 DAY`
      ),
      runHogQLQuery(
        `SELECT count() FROM events
         WHERE event = '$pageview' AND properties.tenant = '${subdomain}'
         AND timestamp > now() - INTERVAL 30 DAY`
      ),
      runHogQLQuery(
        `SELECT event, properties.$host, properties.$current_url, timestamp FROM events
         WHERE timestamp > now() - INTERVAL 60 MINUTE
         ORDER BY timestamp DESC LIMIT 10`
      ),
      runHogQLQuery(
        `SELECT properties.$host, count() as n FROM events
         WHERE timestamp > now() - INTERVAL 60 MINUTE
         GROUP BY properties.$host ORDER BY n DESC LIMIT 10`
      ),
    ])

    return NextResponse.json({
      subdomain,
      tenantHost,
      totalEvents: totalEvents.results[0]?.[0] ?? 0,
      totalPageviews: totalPageviews.results[0]?.[0] ?? 0,
      hostFilterCount: hostFilterCount.results[0]?.[0] ?? 0,
      urlFilterCount: urlFilterCount.results[0]?.[0] ?? 0,
      tenantPropCount: tenantPropCount.results[0]?.[0] ?? 0,
      recentHosts: recentHosts.results.map((r: any[]) => ({ host: r[0], count: r[1] })),
      recentUrls: recentUrls.results.map((r: any[]) => ({ url: r[0], host: r[1], tenant: r[2], timestamp: r[3] })),
      veryRecentEvents: veryRecentEvents.results.map((r: any[]) => ({ event: r[0], host: r[1], url: r[2], timestamp: r[3] })),
      veryRecentHosts: veryRecentHosts.results.map((r: any[]) => ({ host: r[0], count: r[1] })),
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
