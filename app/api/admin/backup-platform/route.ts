import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getResend } from "@/lib/resend"
import { render } from "@react-email/render"
import BackupSuccessEmail from "@/emails/backup-success"
import BackupFailureEmail from "@/emails/backup-failure"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: admin } = await supabase
      .from("super_admins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    console.log("[v0] Starting manual platform backup...")

    // Create backup record
    const { data: backupRecord, error: backupError } = await supabase
      .from("backups")
      .insert({
        backup_type: "manual",
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
      "blog_posts",
      "blog_post_claps",
      "categories",
      "topics",
      "post_topics",
      "supporters",
      "supporter_profiles",
      "donations",
      "financial_supporters",
      "funding_goals",
      "email_logs",
      "newsletters",
      "email_subscribers",
      "newsletter_recipients",
      "newsletter_opens",
      "newsletter_clicks",
      "social_shares",
      "super_admins",
      "help_articles",
      "help_categories",
      "chat_logs",
      "pages",
      "section_templates",
      "page_sections",
      "draft_pages",
      "draft_page_versions",
      "tenant_navigation_menu",
      "tenant_followers",
      "tenant_giving_settings",
      "tenant_about",
      "tenant_campaigns",
      "tenant_contact_submissions",
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
    const estFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    const estParts = estFormatter.formatToParts(now)
    const estDate = {
      year: estParts.find((p) => p.type === "year")?.value,
      month: estParts.find((p) => p.type === "month")?.value,
      day: estParts.find((p) => p.type === "day")?.value,
      hour: estParts.find((p) => p.type === "hour")?.value,
      minute: estParts.find((p) => p.type === "minute")?.value,
      second: estParts.find((p) => p.type === "second")?.value,
    }

    const dateFolder = `${estDate.year}-${estDate.month}-${estDate.day}_${estDate.hour}-${estDate.minute}-${estDate.second}`
    const fileName = `backups/${dateFolder}/platform-manual-backup.json`

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

    console.log("[v0] Manual platform backup completed successfully")

    return NextResponse.json({
      success: true,
      backupId: backupRecord.id,
      recordCount: totalRecords,
      fileSize,
      blobUrl: blob.url,
    })
  } catch (error: any) {
    console.error("[v0] Manual platform backup failed:", error)

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
    const backupEmail = process.env.RESEND_FROM_EMAIL || "backup@tektonstable.com"

    if (status === "success") {
      const emailHtml = render(
        BackupSuccessEmail({
          backupId: data.backupId,
          fileSize: formatFileSize(data.fileSize),
          recordCount: data.recordCount,
          tables: data.tables,
          completedAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
          blobUrl: data.blobUrl,
          backupType: "manual",
        }),
      )

      await resend.emails.send({
        from: backupEmail,
        to: backupEmail,
        subject: `✓ Manual Platform Backup Completed - ${new Date().toLocaleDateString()}`,
        html: emailHtml,
      })

      const supabase = await createClient()
      await supabase
        .from("backups")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq("id", data.backupId)
    } else {
      const supabase = await createClient()
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
          backupType: "manual",
        }),
      )

      await resend.emails.send({
        from: backupEmail,
        to: backupEmail,
        subject: "⚠️ Manual Platform Backup Failed - Action Required",
        html: emailHtml,
      })
    }

    console.log(`[v0] Manual backup ${status} email sent`)
  } catch (error) {
    console.error("[v0] Failed to send backup notification:", error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
