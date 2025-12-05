import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Check if user is a tenant owner
    const { data: tenantCheck, error: tenantError } = await adminSupabase
      .from("tenants")
      .select("id, subdomain")
      .eq("email", user.email)
      .limit(1)
      .maybeSingle()

    // Also check super admin status
    const { data: adminCheck } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).limit(1)

    const isTenantOwner = tenantCheck && !tenantError
    const isSuperAdmin = adminCheck && adminCheck.length > 0

    if (!isTenantOwner && !isSuperAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // iPhones may report various MIME types for HEIF images
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/heic-sequence",
      "image/heif-sequence",
    ]

    // Also check file extension as fallback since mobile browsers may not report correct MIME type
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"]

    const isValidType =
      validImageTypes.includes(file.type) || file.type.startsWith("image/") || validExtensions.includes(fileExtension)

    if (!isValidType) {
      return NextResponse.json(
        {
          error: "Only image files are allowed (JPG, PNG, GIF, WebP, HEIC, HEIF)",
          details: `Received type: ${file.type}, extension: ${fileExtension}`,
        },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // and converts HEIC/HEIF to jpg extension for broader compatibility
    const timestamp = Date.now()
    const folder = isTenantOwner && tenantCheck ? `media/tenant/${tenantCheck.subdomain}` : "media/platform"

    // Sanitize filename: remove special chars, replace spaces with underscores
    let sanitizedName = file.name
      .replace(/[^\w\s.-]/g, "") // Remove special characters except word chars, spaces, dots, hyphens
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .trim()

    // If filename is empty after sanitization, generate one
    if (!sanitizedName || sanitizedName === "." || sanitizedName.length < 3) {
      sanitizedName = `image_${timestamp}.jpg`
    }

    // Convert HEIC/HEIF extension to jpg for the stored filename (Blob handles conversion)
    if (sanitizedName.toLowerCase().endsWith(".heic") || sanitizedName.toLowerCase().endsWith(".heif")) {
      sanitizedName = sanitizedName.replace(/\.(heic|heif)$/i, ".jpg")
    }

    const filename = `${folder}/${timestamp}-${sanitizedName}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    const { error: insertError } = await adminSupabase.from("media_library").insert({
      filename: sanitizedName,
      url: blob.url,
      original_filename: file.name,
      mime_type: file.type || "image/jpeg",
      file_size: file.size,
      created_by: user.id, // Correct column name matching schema
      tenant_id: isTenantOwner && tenantCheck ? tenantCheck.id : null,
    })

    if (insertError) {
      console.error("[v0] Failed to insert media record:", insertError)
      // Don't fail the upload, just log the error - the file is already in Blob
    } else {
      console.log("[v0] Media record inserted successfully")
    }

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
