import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sections } = await request.json()

    // Update each section
    for (const section of sections) {
      const { error } = await supabase
        .from("about_sections")
        .update({
          title: section.title,
          subtitle: section.subtitle,
          background_type: section.background_type,
          background_value: section.background_value,
          text_color: section.text_color,
          content: section.content,
          is_active: section.is_active,
        })
        .eq("id", section.id)

      if (error) {
        console.error("Error updating section:", error)
        return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in about sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
