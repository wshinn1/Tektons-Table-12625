import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase.from("blog_categories").select("id, name, slug").order("name")

  if (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json([], { status: 200 })
  }

  return NextResponse.json(categories || [])
}
