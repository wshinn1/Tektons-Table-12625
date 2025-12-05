import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting tenant media upload...")

    const adminSupabase = createAdminClient()
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("[v0] User authenticated:", user.id)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const tenantId = formData.get("tenantId") as string

    if (!file) {
      console.log("[v0] No file in form data")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", { name: file.name, type: file.type, size: file.size })

    const { data: superAdmin } = await adminSupabase.from("super_admins").select("id").eq("user_id", user.id).single()

    const isSuperAdmin = !!superAdmin
    console.log("[v0] Is super admin:", isSuperAdmin)

    let uploadPath: string
    let tenantIdForDb: string | null = null

    if (isSuperAdmin && (!tenantId || !isValidUUID(tenantId))) {
      // Super admin uploading for platform (not a specific tenant)
      console.log("[v0] Super admin platform upload")
      uploadPath = `media/platform/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    } else if (tenantId && isValidUUID(tenantId)) {
      // Tenant-specific upload
      const { data: tenant, error: tenantError } = await adminSupabase
        .from("tenants")
        .select("id, email, subdomain")
        .eq("id", tenantId)
        .single()

      if (tenantError || !tenant) {
        console.log("[v0] Tenant not found:", tenantError)
        // If super admin, allow anyway
        if (!isSuperAdmin) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }
        uploadPath = `media/platform/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      } else {
        // Check if user owns this tenant or is super admin
        if (tenant.email !== user.email && !isSuperAdmin) {
          console.log("[v0] User does not own this tenant and is not super admin")
          return NextResponse.json({ error: "Access denied" }, { status: 403 })
        }
        console.log("[v0] Tenant verified:", tenant.subdomain)
        uploadPath = `media/tenants/${tenant.subdomain}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        tenantIdForDb = tenant.id
      }
    } else {
      // No valid tenant and not super admin
      if (!isSuperAdmin) {
        console.log("[v0] No tenantId provided and not super admin")
        return NextResponse.json({ error: "No tenantId provided" }, { status: 400 })
      }
      uploadPath = `media/platform/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    }

    if (!file.type.startsWith("image/")) {
      console.log("[v0] Invalid file type")
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log("[v0] File too large")
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    console.log("[v0] Uploading to Blob:", uploadPath)
    const blob = await put(uploadPath, file, {
      access: "public",
    })
    console.log("[v0] Blob upload successful:", blob.url)

    let mediaRecord = null
    if (tenantIdForDb) {
      const { data, error: mediaError } = await adminSupabase
        .from("media_library")
        .insert({
          tenant_id: tenantIdForDb,
          filename: uploadPath,
          original_filename: file.name,
          url: blob.url,
          mime_type: file.type,
          file_size: file.size,
          created_by: user.id,
        })
        .select()
        .single()

      if (mediaError) {
        console.log("[v0] Media library insert error:", mediaError)
      } else {
        mediaRecord = data
        console.log("[v0] Media library record created:", mediaRecord?.id)
      }
    }

    console.log("[v0] Upload complete, returning URL:", blob.url)
    return NextResponse.json({
      url: blob.url,
      media: {
        id: mediaRecord?.id || crypto.randomUUID(),
        url: blob.url,
        filename: uploadPath,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}
