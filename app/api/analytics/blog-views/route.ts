import { NextRequest, NextResponse } from "next/server"

const POSTHOG_API_URL = "https://app.posthog.com"

export async function GET(request: NextRequest) {
  const subdomain = request.nextUrl.searchParams.get("subdomain")
  if (!subdomain) return NextResponse.json({ error: "Missing subdomain" }, { status: 400 })

  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY
  if (!projectId || !apiKey) return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } })

  const tenantHost = `${subdomain}.tektonstable.com`
  const sql = `
    SELECT
      properties.$pathname as path,
      count(DISTINCT concat(toString(properties.$session_id), '|', toString(properties.$pathname))) as views
    FROM events
    WHERE
      properties.$host = '${tenantHost}'
      AND properties.$pathname LIKE '%/blog/%'
      AND properties.$session_id IS NOT NULL
      AND properties.$pathname IS NOT NULL
      AND event NOT IN ('$feature_flag_called', '$$heatmap', '$rageclick')
      AND timestamp > now() - INTERVAL 90 DAY
    GROUP BY properties.$pathname
  `
  try {
    const res = await fetch(`${POSTHOG_API_URL}/api/projects/${projectId}/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: sql } }),
    })
    if (!res.ok) return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } })
    const data = await res.json()
    const viewsBySlug: Record<string, number> = {}
    for (const [path, views] of data.results ?? []) {
      const parts = (path as string).split("/blog/")
      if (parts.length === 2) {
        const slug = parts[1].split("/")[0].split("?")[0]
        if (slug) viewsBySlug[slug] = (viewsBySlug[slug] || 0) + Number(views)
      }
    }
    return NextResponse.json(viewsBySlug, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({}, { headers: { "Cache-Control": "no-store" } })
  }
}
