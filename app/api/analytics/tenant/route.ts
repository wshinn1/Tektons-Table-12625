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
    console.error("[PostHog Query Error]", error)
    throw new Error(`PostHog API error: ${res.status}`)
  }

  return res.json()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get("subdomain")
    const days = parseInt(searchParams.get("days") || "7", 10)

    if (!subdomain) {
      return NextResponse.json({ error: "Missing subdomain parameter" }, { status: 400 })
    }

    // Validate days parameter
    const validDays = [1, 7, 14, 30]
    const queryDays = validDays.includes(days) ? days : 7

    // Build the base filter - use $current_url as primary match with fallbacks
    const tenantHost = `${subdomain}.tektonstable.com`
    const tenantFilter = `(
      properties.$current_url LIKE '%${tenantHost}%'
      OR properties.$host = '${tenantHost}'
      OR properties.tenant = '${subdomain}'
    )`
    const timeFilter = `timestamp > now() - INTERVAL ${queryDays} DAY`
    const baseFilter = `event = '$pageview' AND ${tenantFilter} AND ${timeFilter}`

    // Run all queries in parallel
    const [
      pageviewsResult,
      sessionsResult,
      countriesResult,
      statesResult,
      citiesResult,
      topPagesResult,
      dailyViewsResult,
      recentVisitorsResult,
      locationsResult,
    ] = await Promise.all([
      // Total pageviews
      runHogQLQuery(`SELECT count() as total FROM events WHERE ${baseFilter}`),

      // Unique sessions
      runHogQLQuery(
        `SELECT count(DISTINCT properties.$session_id) as sessions FROM events WHERE ${baseFilter}`
      ),

      // Countries
      runHogQLQuery(
        `SELECT properties.$geoip_country_name as country, count() as users 
         FROM events 
         WHERE ${baseFilter} AND properties.$geoip_country_name IS NOT NULL
         GROUP BY properties.$geoip_country_name 
         ORDER BY users DESC 
         LIMIT 10`
      ),

      // States/Regions
      runHogQLQuery(
        `SELECT properties.$geoip_subdivision_1_name as state, count() as users 
         FROM events 
         WHERE ${baseFilter} AND properties.$geoip_subdivision_1_name IS NOT NULL
         GROUP BY properties.$geoip_subdivision_1_name 
         ORDER BY users DESC 
         LIMIT 10`
      ),

      // Cities
      runHogQLQuery(
        `SELECT properties.$geoip_city_name as city, count() as users 
         FROM events 
         WHERE ${baseFilter} AND properties.$geoip_city_name IS NOT NULL
         GROUP BY properties.$geoip_city_name 
         ORDER BY users DESC 
         LIMIT 10`
      ),

      // Top pages
      runHogQLQuery(
        `SELECT properties.$pathname as path, count() as views 
         FROM events 
         WHERE ${baseFilter} 
         GROUP BY properties.$pathname 
         ORDER BY views DESC 
         LIMIT 10`
      ),

      // Daily pageviews
      runHogQLQuery(
        `SELECT toDate(timestamp) as date, count() as views 
         FROM events 
         WHERE ${baseFilter} 
         GROUP BY date 
         ORDER BY date ASC`
      ),

      // Recent visitors
      runHogQLQuery(
        `SELECT 
           distinct_id, 
           properties.$geoip_city_name as city, 
           properties.$geoip_country_name as country,
           max(timestamp) as last_seen 
         FROM events 
         WHERE ${baseFilter} 
         GROUP BY distinct_id, properties.$geoip_city_name, properties.$geoip_country_name 
         ORDER BY last_seen DESC 
         LIMIT 10`
      ),

      // Visitor locations for map
      runHogQLQuery(
        `SELECT 
           properties.$geoip_latitude as lat, 
           properties.$geoip_longitude as lng, 
           properties.$geoip_city_name as city,
           count() as users 
         FROM events 
         WHERE ${baseFilter} 
           AND properties.$geoip_latitude IS NOT NULL 
           AND properties.$geoip_longitude IS NOT NULL
         GROUP BY properties.$geoip_latitude, properties.$geoip_longitude, properties.$geoip_city_name`
      ),
    ])

    // Transform results into a usable format
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

    const analytics = {
      pageviews: pageviewsResult.results[0]?.[0] || 0,
      sessions: sessionsResult.results[0]?.[0] || 0,
      countries: transformResults(countriesResult),
      states: transformResults(statesResult),
      cities: transformResults(citiesResult),
      topPages: transformResults(topPagesResult),
      dailyViews: transformResults(dailyViewsResult),
      recentVisitors: transformResults(recentVisitorsResult),
      locations: transformResults(locationsResult),
      countryCount: countriesResult.results.length,
      stateCount: statesResult.results.length,
      cityCount: citiesResult.results.length,
      period: queryDays,
    }

    return NextResponse.json(analytics, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[Analytics API Error]", message)

    if (message === "Missing PostHog configuration") {
      return NextResponse.json(
        { error: "PostHog is not configured. Set POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY in your environment variables." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
