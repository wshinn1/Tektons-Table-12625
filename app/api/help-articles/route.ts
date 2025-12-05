import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: articles, error } = await supabase
      .from("help_articles")
      .select("id, title, slug")
      .eq("is_published", true)
      .order("view_count", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error fetching help articles:", error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(articles || [])
  } catch (error) {
    console.error("Help articles API error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
