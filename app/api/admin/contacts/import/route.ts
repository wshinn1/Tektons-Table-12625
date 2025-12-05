import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length === 0) {
      return NextResponse.json({ error: "Empty CSV file" }, { status: 400 })
    }

    // Parse CSV (assuming header row: first_name,last_name,email,phone,tags,notes)
    const headers = lines[0].split(",").map((h) => h.trim())
    const rows = lines.slice(1)

    const supabase = await createServerClient()
    let imported = 0

    for (const row of rows) {
      const values = row.split(",").map((v) => v.trim())
      const contact: any = {}

      headers.forEach((header, index) => {
        if (header === "tags") {
          contact[header] = values[index] ? values[index].split(";").map((t: string) => t.trim()) : []
        } else {
          contact[header] = values[index] || null
        }
      })

      if (contact.email && contact.first_name && contact.last_name) {
        try {
          await supabase.from("contacts").insert({
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            phone: contact.phone,
            tags: contact.tags,
            notes: contact.notes,
            source: "import",
          })
          imported++
        } catch (error) {
          // Skip duplicates
          console.log(`Skipping duplicate: ${contact.email}`)
        }
      }
    }

    return NextResponse.json({ count: imported })
  } catch (error) {
    console.error("Error importing contacts:", error)
    return NextResponse.json({ error: "Failed to import" }, { status: 500 })
  }
}
