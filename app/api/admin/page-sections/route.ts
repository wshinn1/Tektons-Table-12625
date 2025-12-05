import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { page_id, source_type, prismic_slice_type, content, order_index } = body

    // Insert new section
    const { data, error } = await supabase
      .from("page_sections")
      .insert({
        page_id,
        source_type: source_type || "built_in",
        prismic_slice_type,
        content,
        order_index,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating page section:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in page sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sections } = body

    // Update each section
    for (const section of sections) {
      const isNew = section.id?.startsWith("new-")

      if (isNew) {
        // Insert new section
        const { error } = await supabase.from("page_sections").insert({
          page_id: section.page_id,
          source_type: section.source_type || "built_in",
          prismic_slice_type: section.prismic_slice_type,
          content: section.content,
          order_index: section.order_index,
          is_active: section.is_active ?? true,
        })

        if (error) {
          console.error("Error inserting page section:", error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      } else {
        // Update existing section
        const { error } = await supabase
          .from("page_sections")
          .update({
            content: section.content,
            order_index: section.order_index,
            is_active: section.is_active,
            source_type: section.source_type,
            prismic_slice_type: section.prismic_slice_type,
          })
          .eq("id", section.id)

        if (error) {
          console.error("Error updating page section:", error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in page sections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
