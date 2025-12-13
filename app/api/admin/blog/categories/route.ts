import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase.from("blog_categories").select("id, name, slug").order("name")

  if (error) {
    console.error("[v0] Failed to fetch categories:", error)
    return NextResponse.json({ categories: [] }, { status: 200 })
  }

  console.log("[v0] Blog categories fetched:", categories)
  return NextResponse.json({ categories: categories || [] })
}
