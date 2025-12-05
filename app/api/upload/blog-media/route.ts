import { put } from "@vercel/blob"
import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Blog media upload started")

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Check if user is super admin
    const { data: adminCheck } = await supabase.from("super_admins").select("user_id").eq("user_id", user.id).limit(1)

    console.log("[v0] Admin check result:", adminCheck)

    if (!adminCheck || adminCheck.length === 0) {
      console.log("[v0] Admin access required")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, file.type, file.size)

    // Validate file type (images and videos)
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"]
    const validTypes = [...validImageTypes, ...validVideoTypes]

    if (!validTypes.includes(file.type)) {
      console.log("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "Invalid file type. Only images and videos are allowed." }, { status: 400 })
    }

    const maxSize = validVideoTypes.includes(file.type) ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      console.log("[v0] File too large:", file.size)
      const maxSizeMB = validVideoTypes.includes(file.type) ? "500MB" : "10MB"
      return NextResponse.json({ error: `File too large. Maximum size is ${maxSizeMB}.` }, { status: 400 })
    }

    // Upload to Blob
    console.log("[v0] Uploading to Blob...")
    const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    console.log("[v0] Blob upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      type: validImageTypes.includes(file.type) ? "image" : "video",
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
