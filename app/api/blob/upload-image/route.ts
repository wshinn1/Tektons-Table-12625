import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentTenant } from "@/lib/tenant-context"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting newsletter image upload...")

    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No authenticated user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Get tenant context
    const tenant = await getCurrentTenant(supabase)

    if (!tenant) {
      console.log("[v0] No tenant found for user")
      return NextResponse.json({ error: "Tenant not found" }, { status: 403 })
    }

    console.log("[v0] Tenant context:", tenant.id, tenant.slug)

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", { name: file.name, type: file.type, size: file.size })

    if (!file.type.startsWith("image/")) {
      console.log("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const blobPath = `newsletter-images/${tenant.slug}/${timestamp}-${sanitizedFilename}`

    console.log("[v0] Uploading to Blob:", blobPath)

    const blob = await put(blobPath, file, {
      access: "public",
    })

    console.log("[v0] Blob upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
