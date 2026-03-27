import { NextRequest, NextResponse } from "next/server"

const POSTHOG_API_URL = "https://app.posthog.com"

interface QueryResult {
  results: any[][]
  columns: string[]
}

async function runHogQLQuery(sql: string): Promise<QueryResult> {
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
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query: sql,
      },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("[PostHog Debug Query Error]", error)
    throw new Error(`PostHog API error: ${res.status}`)
  }

  return res.json()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get("subdomain")

    if (!subdomain) {
      return NextResponse.json({ error: "Missing subdomain parameter" }, { status: 400 })
    }

    const tenantHost = `${subdomain}.tektonstable.com`

    // Run diagnostic queries in parallel
    const [
      recentEventsResult,
      hostValuesResult,
      currentUrlValuesResult,
      tenantPropValuesResult,
      filterMatchesResult,
    ] = await Promise.all([
      // Get 10 most recent pageview events (any tenant)
      runHogQLQuery(`
        SELECT 
          timestamp,
          event,
          properties.$host as host,
          properties.$current_url as current_url,
          properties.tenant as tenant_prop,
          properties.$pathname as pathname
        FROM events 
        WHERE event = '$pageview' 
        ORDER BY timestamp DESC 
        LIMIT 10
      `),

      // Get distinct $host values in the project
      runHogQLQuery(`
        SELECT DISTINCT properties.$host as host, count() as cnt
        FROM events 
        WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY
        GROUP BY properties.$host
        ORDER BY cnt DESC
        LIMIT 20
      `),

      // Get distinct $current_url patterns
      runHogQLQuery(`
        SELECT DISTINCT properties.$current_url as url, count() as cnt
        FROM events 
        WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY
        GROUP BY properties.$current_url
        ORDER BY cnt DESC
        LIMIT 20
      `),

      // Get distinct tenant property values
      runHogQLQuery(`
        SELECT DISTINCT properties.tenant as tenant, count() as cnt
        FROM events 
        WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY AND properties.tenant IS NOT NULL
        GROUP BY properties.tenant
        ORDER BY cnt DESC
        LIMIT 20
      `),

      // Check which filter would match for this subdomain
      runHogQLQuery(`
        SELECT 
          count() as total_pageviews,
          countIf(properties.$current_url LIKE '%${tenantHost}%') as matches_current_url,
          countIf(properties.$host = '${tenantHost}') as matches_host,
          countIf(properties.tenant = '${subdomain}') as matches_tenant_prop
        FROM events 
        WHERE event = '$pageview' AND timestamp > now() - INTERVAL 7 DAY
      `),
    ])

    const transformResults = (result: QueryResult): any[] => {
      const { results, columns } = result
      return results.map((row) => {
        const obj: Record<string, any> = {}
        columns.forEach((col, i) => {
          obj[col] = row[i]
        })
        return obj
      })
    }

    const debug = {
      subdomain,
      expectedHost: tenantHost,
      recentEvents: transformResults(recentEventsResult),
      distinctHosts: transformResults(hostValuesResult),
      distinctUrls: transformResults(currentUrlValuesResult),
      distinctTenantProps: transformResults(tenantPropValuesResult),
      filterMatches: transformResults(filterMatchesResult)[0] || {},
      posthogProjectId: process.env.POSTHOG_PROJECT_ID ? "configured" : "missing",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(debug, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Analytics Debug Error]", message)

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
