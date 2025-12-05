import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check auth
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
        .from("security_sections")
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

    // Revalidate the security page
    revalidatePath("/security")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating security sections:", error)
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 })
  }
}
