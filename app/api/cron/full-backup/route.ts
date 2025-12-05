import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("[v0] Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting automated full backup...")

    const supabase = await createClient()

    const estDate = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    // Format: 2025-01-24_14-30-00
    const formattedDate = estDate.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2_$4-$5-$6")

    const backupFolder = `backups/${formattedDate}`

    // 1. Backup all database tables
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
        }
      } catch (err) {
        console.log(`[v0] Warning: Could not backup table ${table}`)
      }
    }

    // 2. Get all media files from blob storage
    const { list } = await import("@vercel/blob")
    const { blobs } = await list()
    const mediaFiles = blobs.filter((blob) => !blob.pathname.startsWith("backups/"))

    // 3. Get core application code files
    const codeFiles: Record<string, string> = {}
    const filesToBackup = ["package.json", "tsconfig.json", "next.config.mjs", "middleware.ts", "README.md"]

    for (const file of filesToBackup) {
      try {
        const content = await fs.readFile(path.join(process.cwd(), file), "utf-8")
        codeFiles[file] = content
      } catch (err) {
        console.log(`[v0] Warning: Could not backup ${file}`)
      }
    }

    // 4. Get SQL migration scripts
    const migrationScripts: Record<string, string> = {}
    try {
      const scriptsDir = path.join(process.cwd(), "scripts")
      const scriptFiles = await fs.readdir(scriptsDir)

      for (const file of scriptFiles) {
        if (file.endsWith(".sql")) {
          const content = await fs.readFile(path.join(scriptsDir, file), "utf-8")
          migrationScripts[file] = content
        }
      }
    } catch (err) {
      console.log("[v0] Warning: Could not backup migration scripts")
    }

    // 5. Create comprehensive backup object
    const fullBackup = {
      metadata: {
        backupType: "automated_full",
        timestamp: new Date().toISOString(),
        timestampEST: estDate, // Add EST timestamp to metadata
        version: "1.0.0",
        description: "Automated full platform backup including database, media, code, and migrations",
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

    const jsonData = JSON.stringify(fullBackup, null, 2)
    const fileSizeBytes = Buffer.byteLength(jsonData)
    const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)

    const blob = await put(`${backupFolder}/full-backup.json`, jsonData, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save backup record
    await supabase.from("backups").insert({
      backup_type: "scheduled",
      backup_category: "full",
      file_size_bytes: fileSizeBytes,
      record_count: totalRecords,
      blob_url: blob.url,
      status: "completed",
      metadata: fullBackup.metadata,
    })

    console.log(`[v0] Automated full backup completed successfully`)

    // Send email notification
    await sendBackupNotificationEmail({
      type: "success",
      backupUrl: blob.url,
      backupFolder: formattedDate, // Pass folder name for email
      fileSize: fileSizeMB,
      databaseRecords: totalRecords,
      mediaFiles: mediaFiles.length,
      codeFiles: Object.keys(codeFiles).length,
      migrationScripts: Object.keys(migrationScripts).length,
    })

    return NextResponse.json({
      success: true,
      backupUrl: blob.url,
      backupFolder: formattedDate, // Return folder name
      summary: {
        databaseRecords: totalRecords,
        mediaFiles: mediaFiles.length,
        codeFiles: Object.keys(codeFiles).length,
        migrationScripts: Object.keys(migrationScripts).length,
        totalSizeMB: fileSizeMB,
      },
    })
  } catch (error: any) {
    console.error("[v0] Automated full backup error:", error)

    // Send failure email
    await sendBackupNotificationEmail({
      type: "failure",
      error: error.message,
    })

    return NextResponse.json({ error: "Backup failed", details: error.message }, { status: 500 })
  }
}

async function sendBackupNotificationEmail(data: {
  type: "success" | "failure"
  backupUrl?: string
  backupFolder?: string // Add folder name parameter
  fileSize?: string
  databaseRecords?: number
  mediaFiles?: number
  codeFiles?: number
  migrationScripts?: number
  error?: string
}) {
  try {
    console.log("[v0] Starting backup email notification...")

    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email notification")
      return
    }

    const supabase = await createClient()

    console.log("[v0] Fetching super admin emails...")
    const { data: superAdmins, error: adminError } = await supabase.from("super_admins").select("email")

    const adminEmails: string[] = []

    if (!adminError && superAdmins && superAdmins.length > 0) {
      adminEmails.push(...superAdmins.map((admin) => admin.email).filter(Boolean))
    }

    // Always ensure weshinn@gmail.com gets the backup notification
    if (!adminEmails.includes("weshinn@gmail.com")) {
      adminEmails.push("weshinn@gmail.com")
    }

    if (adminEmails.length === 0) {
      console.log("[v0] No valid email addresses found")
      return
    }

    console.log(`[v0] Found ${adminEmails.length} recipient(s):`, adminEmails)

    const resend = getResend()
    const fromEmail = process.env.RESEND_FROM_EMAIL || "support@tektonstable.com"

    console.log(`[v0] Sending ${data.type} email from: ${fromEmail}`)

    if (data.type === "success") {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .stat { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .stat-label { font-weight: 600; color: #6b7280; }
              .stat-value { color: #111827; font-weight: 500; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .folder-info { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">✓ Automated Backup Completed</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Full platform backup successfully created</p>
              </div>
              <div class="content">
                <p>Your scheduled automated backup has been completed successfully.</p>
                
                ${
                  data.backupFolder
                    ? `
                <div class="folder-info">
                  <strong>Backup Location:</strong><br>
                  <code style="font-size: 13px;">backups/${data.backupFolder}/</code>
                </div>
                `
                    : ""
                }
                
                <div style="margin: 20px 0;">
                  <div class="stat">
                    <span class="stat-label">Backup Time (EST):</span>
                    <span class="stat-value">${data.backupFolder?.replace("_", " ").replace(/-/g, "/")}</span>
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
                  The backup file has been stored securely in Vercel Blob Storage and can be accessed from your admin dashboard.
                </p>
              </div>
              <div class="footer">
                <p>Tekton's Table Automated Backup System</p>
                <p>Next scheduled backup: ${getNextBackupTime()}</p>
              </div>
            </div>
          </body>
        </html>
      `

      console.log("[v0] Sending success email...")
      await resend.emails.send({
        from: `Tekton's Table Backups <${fromEmail}>`,
        to: adminEmails,
        subject: "✓ Automated Full Backup Completed Successfully",
        html: emailHtml,
      })

      console.log(`[v0] Backup success email sent to ${adminEmails.length} recipient(s): ${adminEmails.join(", ")}`)
    } else {
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
              .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">⚠️ Automated Backup Failed</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Action required - backup process encountered an error</p>
              </div>
              <div class="content">
                <p><strong>The scheduled automated backup failed to complete.</strong></p>
                
                <div class="error-box">
                  <strong>Error Details:</strong><br>
                  <code style="font-size: 13px;">${data.error}</code>
                </div>

                <p><strong>What should you do?</strong></p>
                <ul>
                  <li>Check the Vercel logs for more details</li>
                  <li>Verify your Vercel Blob storage limits haven't been exceeded</li>
                  <li>Try running a manual backup from the admin dashboard</li>
                  <li>Contact support if the issue persists</li>
                </ul>

                <p style="margin-top: 20px;">
                  <strong>Failed at:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })} EST
                </p>

                <a href="https://tektonstable.com/admin/backups" class="button">Go to Backup Dashboard</a>
              </div>
              <div class="footer">
                <p>Tekton's Table Automated Backup System</p>
                <p>If you continue to receive this error, please investigate immediately.</p>
              </div>
            </div>
          </body>
        </html>
      `

      console.log("[v0] Sending failure email...")
      await resend.emails.send({
        from: `Tekton's Table Backups <${fromEmail}>`,
        to: adminEmails,
        subject: "⚠️ Automated Backup Failed - Action Required",
        html: emailHtml,
      })

      console.log(`[v0] Backup failure email sent to ${adminEmails.length} recipient(s): ${adminEmails.join(", ")}`)
    }
  } catch (error) {
    console.error("[v0] Failed to send backup notification email:", error)
  }
}

function getNextBackupTime(): string {
  const now = new Date()
  const nextBackup = new Date(now)

  const currentHour = now.getHours()

  if (currentHour < 12) {
    nextBackup.setHours(12, 0, 0, 0)
  } else {
    nextBackup.setDate(nextBackup.getDate() + 1)
    nextBackup.setHours(0, 0, 0, 0)
  }

  return (
    nextBackup.toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " EST"
  )
}
