import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sections } = await request.json()

    for (const section of sections) {
      const { error } = await supabase
        .from("how_it_works_sections")
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

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating how-it-works sections:", error)
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 })
  }
}
