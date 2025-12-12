import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

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

    console.log("[v0] API received sections count:", sections?.length)

    const newSections = sections.filter((s: any) => String(s.id).startsWith("new-"))
    const existingSections = sections.filter((s: any) => !String(s.id).startsWith("new-"))

    console.log("[v0] New sections:", newSections.length, "Existing sections:", existingSections.length)

    for (const section of newSections) {
      const insertData: any = {
        section_key: section.section_key || `section_${Date.now()}`,
        section_type: section.section_type,
        is_active: section.is_active,
        display_order: section.display_order,
        source_type: section.source_type || "built_in",
        section_template_id: section.section_template_id || null,
      }

      // For template-based sections, store everything in content
      if (section.section_template_id) {
        insertData.content = section.content || {}
      } else {
        // For legacy sections, use individual fields
        insertData.title = section.title
        insertData.subtitle = section.subtitle
        insertData.background_type = section.background_type
        insertData.background_value = section.background_value
        insertData.button_text = section.button_text
        insertData.button_url = section.button_url
        insertData.button_color = section.button_color
        insertData.content = section.content
      }

      if (section.prismic_slice_type) {
        insertData.prismic_slice_type = section.prismic_slice_type
        insertData.prismic_document_id = section.prismic_document_id
      }

      const { error } = await supabase.from("homepage_sections").insert(insertData)

      if (error) {
        console.error("Error inserting section:", error)
        return NextResponse.json({ error: `Failed to insert section: ${error.message}` }, { status: 500 })
      }
    }

    for (const section of existingSections) {
      const updateData: any = {
        is_active: section.is_active,
        display_order: section.display_order,
        source_type: section.source_type || "built_in",
        section_template_id: section.section_template_id || null,
      }

      if (section.section_template_id) {
        updateData.content = section.content || {}
        console.log("[v0] Updating section", section.id, "with content:", JSON.stringify(updateData.content))
      } else {
        // For legacy sections, use individual fields
        updateData.title = section.title
        updateData.subtitle = section.subtitle
        updateData.background_type = section.background_type
        updateData.background_value = section.background_value
        updateData.button_text = section.button_text
        updateData.button_url = section.button_url
        updateData.button_color = section.button_color
        updateData.content = section.content
      }

      if (section.prismic_slice_type) {
        updateData.prismic_slice_type = section.prismic_slice_type
        updateData.prismic_document_id = section.prismic_document_id
      }

      const { error } = await supabase.from("homepage_sections").update(updateData).eq("id", section.id)

      if (error) {
        console.error("[v0] Error updating section:", section.id, error)
        return NextResponse.json({ error: `Failed to update section: ${error.message}` }, { status: 500 })
      } else {
        console.log("[v0] Successfully updated section:", section.id)
      }
    }

    revalidatePath("/")
    console.log("[v0] Revalidated homepage path")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in homepage sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get("id")

    if (!sectionId) {
      return NextResponse.json({ error: "Section ID required" }, { status: 400 })
    }

    // Mark section as inactive instead of deleting
    const { error } = await supabase.from("homepage_sections").update({ is_active: false }).eq("id", sectionId)

    if (error) {
      console.error("Error deleting section:", error)
      return NextResponse.json({ error: `Failed to delete section: ${error.message}` }, { status: 500 })
    }

    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete section API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
