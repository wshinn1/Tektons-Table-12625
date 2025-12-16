import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params
    const body = await request.json()

    console.log("[v0] Creating page for tenant:", tenantId)
    console.log("[v0] Request body keys:", Object.keys(body))

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 })
    }

    console.log("[v0] Current user:", user.id)

    const { title, slug, content, tenant_id } = body

    // Use provided tenant_id if available, otherwise use from params
    const actualTenantId = tenant_id || tenantId

    // Generate title and slug if not provided
    const pageTitle = title || `Page ${Date.now()}`
    const pageSlug = slug || `page-${Date.now()}`

    const pageData = {
      tenant_id: actualTenantId,
      title: pageTitle,
      slug: pageSlug,
      html_content: typeof content === "string" ? content : "",
      design_json: typeof content === "object" ? content : null,
      status: "draft",
    }

    console.log("[v0] Inserting page data:", JSON.stringify(pageData).slice(0, 200))

    // Create the page
    const { data: page, error } = await supabase.from("tenant_pages").insert(pageData).select().single()

    if (error) {
      console.error("[v0] Error creating page:", error)
      return NextResponse.json(
        {
          error: "Failed to create page",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Page created successfully:", page.id)
    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/tenant/[tenantId]/pages:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const supabase = await createServerClient()
    const { tenantId } = params

    const { data: pages, error } = await supabase
      .from("tenant_pages")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching pages:", error)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("[v0] Error in GET /api/tenant/[tenantId]/pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
