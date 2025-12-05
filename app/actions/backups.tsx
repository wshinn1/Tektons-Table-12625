"use server"

import { createClient } from "@/lib/supabase/server"
import { put, list } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"
import { getResend } from "@/lib/resend"

export async function createPlatformBackup() {
  try {
    const supabase = await createClient()

    // Fetch all platform data
    const tables = [
      "tenants",
      "super_admins",
      "platform_settings",
      "pages",
      "blog_posts",
      "sections",
      "menus",
      "donations",
    ]

    const backupData: Record<string, any> = {}
    let totalRecords = 0

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")
      if (!error && data) {
        backupData[table] = data
        totalRecords += data.length
      }
    }

    const jsonData = JSON.stringify(backupData, null, 2)
    const blob = await put(`backups/platform-${Date.now()}.json`, jsonData, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save backup record
    await supabase.from("backups").insert({
      backup_type: "manual",
      backup_category: "platform",
      file_size_bytes: Buffer.byteLength(jsonData),
      record_count: totalRecords,
      blob_url: blob.url,
      status: "completed",
    })

    revalidatePath("/admin/backups")

    return { success: true, downloadUrl: blob.url }
  } catch (error) {
    console.error("Backup error:", error)
    return { success: false, error: "Failed to create backup" }
  }
}

export async function createBlobBackup() {
  try {
    const result = await createPlatformBackup()
    return result
  } catch (error) {
    return { success: false, error: "Failed to create blob backup" }
  }
}

export async function createFullBackup() {
  try {
    const supabase = await createClient()
    console.log("[v0] Starting full backup process...")

    // 1. Backup all database tables
    console.log("[v0] Backing up database tables...")
    const tables = [
      "tenants",
      "super_admins",
      "platform_settings",
      "pages",
      "blog_posts",
      "sections",
      "menus",
      "donations",
      "backups",
      "campaigns",
      "supporters",
      "newsletter_subscriptions",
      "contact_submissions",
      "events",
    ]

    const databaseBackup: Record<string, any> = {}
    let totalRecords = 0

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*")
        if (!error && data) {
          databaseBackup[table] = data
          totalRecords += data.length
          console.log(`[v0] Backed up ${data.length} records from ${table}`)
        } else if (error) {
          console.log(`[v0] Warning: Could not backup table ${table}: ${error.message}`)
        }
      } catch (err) {
        console.log(`[v0] Warning: Error backing up table ${table}`)
      }
    }

    // 2. Get all media files from blob storage
    console.log("[v0] Fetching media files from blob storage...")
    let mediaFiles: any[] = []
    try {
      const { blobs } = await list()
      mediaFiles = blobs.filter((blob) => !blob.pathname.startsWith("backups/"))
      console.log(`[v0] Found ${mediaFiles.length} media files in blob storage`)
    } catch (err) {
      console.log("[v0] Warning: Could not fetch media files from blob storage")
    }

    // 3. Get all application code files
    console.log("[v0] Backing up application code...")
    const codeFiles: Record<string, string> = {}
    const filesToBackup = [
      // Core configuration
      "package.json",
      "tsconfig.json",
      "next.config.mjs",
      "components.json",
      "tailwind.config.ts",
      "middleware.ts",

      // Documentation
      "README.md",
      "ADMIN_SETUP.md",
      "ADMIN_REDESIGN_PLAN.md",
      "TENANT_REDESIGN_PLAN.md",
      "TECHNICAL_PLAN.md",
      "DRAFT_PAGES_PLAN.md",
    ]

    for (const file of filesToBackup) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), "utf-8")
        codeFiles[file] = content
        console.log(`[v0] Backed up ${file}`)
      } catch (err) {
        console.log(`[v0] Warning: Could not backup ${file}`)
      }
    }

    // 4. Get all SQL migration scripts
    console.log("[v0] Backing up SQL migration scripts...")
    const migrationScripts: Record<string, string> = {}
    try {
      const scriptsDir = path.join(process.cwd(), "scripts")
      const scriptFiles = await fs.readdir(scriptsDir)

      for (const file of scriptFiles) {
        if (file.endsWith(".sql")) {
          const content = await fs.readFile(path.join(scriptsDir, file), "utf-8")
          migrationScripts[file] = content
          console.log(`[v0] Backed up migration script: ${file}`)
        }
      }
      console.log(`[v0] Backed up ${Object.keys(migrationScripts).length} migration scripts`)
    } catch (err) {
      console.log("[v0] Warning: Could not backup migration scripts")
    }

    // 5. Create comprehensive backup object
    const fullBackup = {
      metadata: {
        backupType: "full",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        description: "Complete platform backup including database, media, code, and migrations",
      },
      database: {
        tables: databaseBackup,
        totalRecords,
      },
      media: {
        files: mediaFiles.map((blob) => ({
          pathname: blob.pathname,
          url: blob.url,
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        })),
        totalFiles: mediaFiles.length,
      },
      code: {
        files: codeFiles,
        totalFiles: Object.keys(codeFiles).length,
      },
      migrations: {
        scripts: migrationScripts,
        totalScripts: Object.keys(migrationScripts).length,
      },
    }

    console.log("[v0] Creating backup file...")
    const jsonData = JSON.stringify(fullBackup, null, 2)
    const fileSizeBytes = Buffer.byteLength(jsonData)
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

    console.log(`[v0] Full backup size: ${fileSizeMB} MB`)

    // Upload to blob storage
    const blob = await put(`backups/full-backup-${Date.now()}.json`, jsonData, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save backup record
    await supabase.from("backups").insert({
      backup_type: "manual",
      backup_category: "full",
      file_size_bytes: fileSizeBytes,
      record_count: totalRecords,
      blob_url: blob.url,
      status: "completed",
      metadata: fullBackup.metadata,
    })

    console.log(`[v0] Full backup completed successfully: ${blob.url}`)

    await sendManualBackupEmail({
      backupUrl: blob.url,
      fileSize: fileSizeMB,
      databaseRecords: totalRecords,
      mediaFiles: mediaFiles.length,
      codeFiles: Object.keys(codeFiles).length,
      migrationScripts: Object.keys(migrationScripts).length,
    })

    revalidatePath("/admin/backups")

    return {
      success: true,
      downloadUrl: blob.url,
      summary: {
        databaseRecords: totalRecords,
        mediaFiles: mediaFiles.length,
        codeFiles: Object.keys(codeFiles).length,
        migrationScripts: Object.keys(migrationScripts).length,
        totalSizeMB: fileSizeMB,
      },
    }
  } catch (error) {
    console.error("[v0] Full backup error:", error)

    await sendManualBackupEmail({
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return { success: false, error: "Failed to create full backup" }
  }
}

export async function restoreBackup(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const text = await file.text()
    const backupData = JSON.parse(text)

    const supabase = await createClient()

    // Restore each table
    for (const [table, data] of Object.entries(backupData.database.tables)) {
      if (Array.isArray(data)) {
        // Delete existing data
        await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")

        // Insert backup data
        if (data.length > 0) {
          await supabase.from(table).insert(data)
        }
      }
    }

    // Restore media files
    console.log("[v0] Restoring media files...")
    for (const mediaFile of backupData.media.files) {
      // Fetch the media file content from the backup
      const response = await fetch(mediaFile.url)
      const mediaContent = await response.arrayBuffer()

      // Upload the media file to blob storage
      await put(mediaFile.pathname, mediaContent, {
        access: "public",
        contentType: response.headers.get("content-type") || "application/octet-stream",
      })
      console.log(`[v0] Restored media file: ${mediaFile.pathname}`)
    }

    // Restore application code files
    console.log("[v0] Restoring application code files...")
    for (const [file, content] of Object.entries(backupData.code.files)) {
      await fs.writeFile(path.join(process.cwd(), file), content, "utf-8")
      console.log(`[v0] Restored code file: ${file}`)
    }

    // Restore SQL migration scripts
    console.log("[v0] Restoring SQL migration scripts...")
    for (const [file, content] of Object.entries(backupData.migrations.scripts)) {
      await fs.writeFile(path.join(process.cwd(), "scripts", file), content, "utf-8")
      console.log(`[v0] Restored migration script: ${file}`)
    }

    revalidatePath("/admin/backups")

    return { success: true }
  } catch (error) {
    console.error("Restore error:", error)
    return { success: false, error: "Failed to restore backup" }
  }
}

export async function restoreBackupById(backupId: string) {
  try {
    const supabase = await createClient()

    const { data: backup } = await supabase.from("backups").select("*").eq("id", backupId).single()

    if (!backup || !backup.blob_url) {
      return { success: false, error: "Backup not found" }
    }

    // Fetch backup file from blob storage
    const response = await fetch(backup.blob_url)
    const backupData = await response.json()

    // Restore each table
    for (const [table, data] of Object.entries(backupData.database.tables)) {
      if (Array.isArray(data)) {
        await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000")

        if (data.length > 0) {
          await supabase.from(table).insert(data)
        }
      }
    }

    // Restore media files
    console.log("[v0] Restoring media files...")
    for (const mediaFile of backupData.media.files) {
      // Fetch the media file content from the backup
      const response = await fetch(mediaFile.url)
      const mediaContent = await response.arrayBuffer()

      // Upload the media file to blob storage
      await put(mediaFile.pathname, mediaContent, {
        access: "public",
        contentType: response.headers.get("content-type") || "application/octet-stream",
      })
      console.log(`[v0] Restored media file: ${mediaFile.pathname}`)
    }

    // Restore application code files
    console.log("[v0] Restoring application code files...")
    for (const [file, content] of Object.entries(backupData.code.files)) {
      await fs.writeFile(path.join(process.cwd(), file), content, "utf-8")
      console.log(`[v0] Restored code file: ${file}`)
    }

    // Restore SQL migration scripts
    console.log("[v0] Restoring SQL migration scripts...")
    for (const [file, content] of Object.entries(backupData.migrations.scripts)) {
      await fs.writeFile(path.join(process.cwd(), "scripts", file), content, "utf-8")
      console.log(`[v0] Restored migration script: ${file}`)
    }

    revalidatePath("/admin/backups")

    return { success: true }
  } catch (error) {
    console.error("Restore error:", error)
    return { success: false, error: "Failed to restore backup" }
  }
}

export async function deleteBackup(backupId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("backups").delete().eq("id", backupId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin/backups")

    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return { success: false, error: "Failed to delete backup" }
  }
}

async function sendManualBackupEmail(data: {
  backupUrl?: string
  fileSize?: string
  databaseRecords?: number
  mediaFiles?: number
  codeFiles?: number
  migrationScripts?: number
  error?: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email notification")
      return
    }

    const supabase = await createClient()

    // Get super admin emails
    const { data: superAdmins } = await supabase.from("super_admins").select("email")

    if (!superAdmins || superAdmins.length === 0) {
      console.log("[v0] No super admins found to notify")
      return
    }

    const adminEmails = superAdmins.map((admin) => admin.email)
    const resend = getResend()
    const fromEmail = process.env.RESEND_FROM_EMAIL || "backups@tektonstable.com"

    if (data.error) {
      // Send failure email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px; border: 2px solid #fecaca; }
              .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">⚠️ Manual Backup Failed</h1>
              </div>
              <div class="content">
                <p><strong>Your manual backup request failed to complete.</strong></p>
                <div class="error-box">
                  <strong>Error Details:</strong><br>
                  <code style="font-size: 13px;">${data.error}</code>
                </div>
                <p><strong>Failed at:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} EST</p>
              </div>
            </div>
          </body>
        </html>
      `

      await resend.emails.send({
        from: `Tekton's Table Backups <${fromEmail}>`,
        to: adminEmails,
        subject: "⚠️ Manual Backup Failed",
        html: emailHtml,
      })
    } else {
      // Send success email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .stat { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .stat-label { font-weight: 600; color: #6b7280; }
              .stat-value { color: #111827; font-weight: 500; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">✓ Manual Backup Completed</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your full backup has been created successfully</p>
              </div>
              <div class="content">
                <p>Your manual full backup request has been completed successfully.</p>
                
                <div style="margin: 20px 0;">
                  <div class="stat">
                    <span class="stat-label">Backup Time:</span>
                    <span class="stat-value">${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })} EST</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Database Records:</span>
                    <span class="stat-value">${data.databaseRecords?.toLocaleString()}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Media Files:</span>
                    <span class="stat-value">${data.mediaFiles?.toLocaleString()}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Code Files:</span>
                    <span class="stat-value">${data.codeFiles}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Migration Scripts:</span>
                    <span class="stat-value">${data.migrationScripts}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Total File Size:</span>
                    <span class="stat-value">${data.fileSize} MB</span>
                  </div>
                </div>

                <a href="${data.backupUrl}" class="button">Download Backup</a>

                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                  The backup file is available in your admin dashboard at <strong>/admin/backups</strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      await resend.emails.send({
        from: `Tekton's Table Backups <${fromEmail}>`,
        to: adminEmails,
        subject: "✓ Manual Full Backup Completed Successfully",
        html: emailHtml,
      })
    }

    console.log(`[v0] Manual backup email sent to ${adminEmails.length} admin(s)`)
  } catch (error) {
    console.error("[v0] Failed to send manual backup email:", error)
  }
}
