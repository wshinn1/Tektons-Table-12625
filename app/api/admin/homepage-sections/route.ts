import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sections } = await request.json()

    const newSections = sections.filter((s: any) => String(s.id).startsWith("new-"))
    const existingSections = sections.filter((s: any) => !String(s.id).startsWith("new-"))

    // Insert new sections
    for (const section of newSections) {
      const { error } = await supabase.from("homepage_sections").insert({
        section_key: section.section_key || `section_${Date.now()}`,
        section_type: section.section_type,
        title: section.title,
        subtitle: section.subtitle,
        background_type: section.background_type,
        background_value: section.background_value,
        button_text: section.button_text,
        button_url: section.button_url,
        button_color: section.button_color,
        content: section.content,
        is_active: section.is_active,
        display_order: section.display_order,
        source_type: section.source_type || "built_in",
        prismic_slice_type: section.prismic_slice_type || null,
        prismic_document_id: section.prismic_document_id || null,
        section_template_id: section.section_template_id || null,
      })

      if (error) {
        console.error("Error inserting section:", error)
        return NextResponse.json({ error: "Failed to insert section" }, { status: 500 })
      }
    }

    // Update existing sections
    for (const section of existingSections) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          title: section.title,
          subtitle: section.subtitle,
          background_type: section.background_type,
          background_value: section.background_value,
          button_text: section.button_text,
          button_url: section.button_url,
          button_color: section.button_color,
          content: section.content,
          is_active: section.is_active,
          display_order: section.display_order,
          source_type: section.source_type || "built_in",
          prismic_slice_type: section.prismic_slice_type || null,
          prismic_document_id: section.prismic_document_id || null,
          section_template_id: section.section_template_id || null,
        })
        .eq("id", section.id)

      if (error) {
        console.error("Error updating section:", error)
        return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in homepage sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
