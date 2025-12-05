import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { render } from "@react-email/render"
import BackupSuccessEmail from "@/emails/backup-success"
import BackupFailureEmail from "@/emails/backup-failure"

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting platform backup...")
    const supabase = createClient()

    // Create backup record
    const { data: backupRecord, error: backupError } = await supabase
      .from("backups")
      .insert({
        backup_type: "full",
        backup_category: "platform",
        status: "in_progress",
        started_at: new Date().toISOString(),
        retention_days: 30,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (backupError) throw backupError

    const tables = [
      "tenants",
      "support_tiers",
      "posts",
      "categories",
      "topics",
      "post_topics",
      "supporters",
      "supporter_profiles",
      "donations",
      "funding_goals",
      "email_logs",
      "newsletters",
      "newsletter_recipients",
      "social_shares",
      "super_admins",
      "help_articles",
      "help_categories",
      "chat_logs",
      "pages",
      "section_templates",
      "page_sections",
    ]

    const backupData: Record<string, any[]> = {}
    let totalRecords = 0

    // Export each table
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")

      if (error) {
        console.error(`[v0] Error backing up ${table}:`, error)
        backupData[table] = []
      } else {
        backupData[table] = data || []
        totalRecords += data?.length || 0
      }
    }

    const now = new Date()
    const dateFolder = now.toISOString().split("T")[0] // YYYY-MM-DD
    const timestamp = now.toISOString().replace(/[:.]/g, "-")
    const fileName = `backups/platform/${dateFolder}/platform-${timestamp}.json`

    const backupJson = JSON.stringify(backupData, null, 2)
    const fileSize = Buffer.byteLength(backupJson, "utf8")

    const blob = await put(fileName, backupJson, {
      access: "public",
      addRandomSuffix: false,
    })

    // Update backup record with success
    const { error: updateError } = await supabase
      .from("backups")
      .update({
        status: "completed",
        blob_url: blob.url,
        blob_key: fileName,
        file_size_bytes: fileSize,
        tables_backed_up: tables,
        record_count: totalRecords,
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupRecord.id)

    if (updateError) throw updateError

    await sendBackupNotification("success", {
      backupId: backupRecord.id,
      fileSize,
      recordCount: totalRecords,
      blobUrl: blob.url,
      tables,
      backupType: "platform",
    })

    console.log("[v0] Platform backup completed successfully")

    return NextResponse.json({
      success: true,
      backupId: backupRecord.id,
      recordCount: totalRecords,
      fileSize,
      blobUrl: blob.url,
    })
  } catch (error: any) {
    console.error("[v0] Platform backup failed:", error)

    await sendBackupNotification("failure", {
      error: error.message,
      backupType: "platform",
    })

    return NextResponse.json({ error: "Platform backup failed", details: error.message }, { status: 500 })
  }
}

async function sendBackupNotification(status: "success" | "failure", data: any) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email notification")
      return
    }

    const resend = getResend()
    const fromEmail = process.env.RESEND_FROM_EMAIL || "backup@tektonstable.com"
    const toEmail = "weshinn@gmail.com"

    if (status === "success") {
      const emailHtml = render(
        BackupSuccessEmail({
          backupId: data.backupId,
          fileSize: formatFileSize(data.fileSize),
          recordCount: data.recordCount,
          tables: data.tables,
          completedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
          blobUrl: data.blobUrl,
          backupType: data.backupType,
        }),
      )

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `✓ Platform Backup Completed - ${new Date().toLocaleDateString()}`,
        html: emailHtml,
      })

      const supabase = createClient()
      await supabase
        .from("backups")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", data.backupId)
    } else {
      const supabase = createClient()
      const { data: lastBackup } = await supabase
        .from("backups")
        .select("completed_at, record_count")
        .eq("status", "completed")
        .eq("backup_category", "platform")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single()

      const emailHtml = render(
        BackupFailureEmail({
          errorMessage: data.error,
          startedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
          lastSuccessfulBackup: lastBackup
            ? {
                completedAt: new Date(lastBackup.completed_at).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                }),
                recordCount: lastBackup.record_count,
              }
            : undefined,
          backupType: data.backupType,
        }),
      )

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: "⚠️ Platform Backup Failed - Action Required",
        html: emailHtml,
      })
    }

    console.log(`[v0] Platform backup ${status} email sent to ${toEmail}`)
  } catch (error) {
    console.error("[v0] Failed to send backup notification:", error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
