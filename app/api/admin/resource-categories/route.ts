import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase.from("resource_categories").select("*").order("display_order")

  if (error) {
    console.error("Failed to fetch resource categories:", error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(categories || [])
}
