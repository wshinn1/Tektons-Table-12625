import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  const supabase = await createServerClient()

  // Verify super admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("user_id", user.id).single()

  if (!superAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { sections } = await request.json()

  // Update each section
  for (const section of sections) {
    const { error } = await supabase
      .from("blog_page_sections")
      .update({
        content: section.content,
        display_order: section.display_order,
        is_active: section.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section.id)

    if (error) {
      console.error("Error updating section:", error)
      return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createServerClient()

  const { data: sections, error } = await supabase
    .from("blog_page_sections")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sections })
}
