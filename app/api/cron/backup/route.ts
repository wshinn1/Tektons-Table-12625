import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getResend } from "@/lib/resend"

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Create backup record
    const { data: backupRecord, error: backupError } = await supabase
      .from("backups")
      .insert({
        backup_type: "full",
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (backupError) throw backupError

    // Tables to backup
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
    ]

    const backupData: Record<string, any[]> = {}
    let totalRecords = 0

    // Export each table
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")

      if (error) {
        console.error(`Error backing up ${table}:`, error)
        backupData[table] = []
      } else {
        backupData[table] = data || []
        totalRecords += data?.length || 0
      }
    }

    // Compress and upload to Blob
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `backup-${timestamp}.json`
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

    // Send success email to super admin
    await sendBackupNotification("success", {
      backupId: backupRecord.id,
      fileSize,
      recordCount: totalRecords,
      blobUrl: blob.url,
      tables,
    })

    return NextResponse.json({
      success: true,
      backupId: backupRecord.id,
      recordCount: totalRecords,
      fileSize,
      blobUrl: blob.url,
    })
  } catch (error: any) {
    console.error("Backup failed:", error)

    // Send failure email
    await sendBackupNotification("failure", {
      error: error.message,
    })

    return NextResponse.json({ error: "Backup failed", details: error.message }, { status: 500 })
  }
}

async function sendBackupNotification(status: "success" | "failure", data: any) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email notification")
      return
    }

    const supabase = await createClient()

    const { data: superAdmins } = await supabase.from("super_admins").select("email")

    if (!superAdmins || superAdmins.length === 0) {
      console.log("[v0] No super admins found to notify")
      return
    }

    const adminEmails = superAdmins.map((admin) => admin.email)
    const resend = getResend()

    if (status === "success") {
      const emailHtml = `
        <h2>✓ Database Backup Completed Successfully</h2>
        <p><strong>Backup ID:</strong> ${data.backupId}</p>
        <p><strong>File Size:</strong> ${formatFileSize(data.fileSize)}</p>
        <p><strong>Records Backed Up:</strong> ${data.recordCount}</p>
        <p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Tables Backed Up:</strong></p>
        <ul>${data.tables.map((t: string) => `<li>${t}</li>`).join("")}</ul>
        <p><a href="${data.blobUrl}">Download Backup</a></p>
      `

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@tektonstable.com",
        to: adminEmails,
        subject: "✓ Database Backup Completed Successfully",
        html: emailHtml,
      })
    } else {
      const { data: lastBackup } = await supabase
        .from("backups")
        .select("completed_at, record_count")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single()

      const emailHtml = `
        <h2>⚠️ Database Backup Failed - Action Required</h2>
        <p><strong>Error:</strong> ${data.error}</p>
        <p><strong>Started At:</strong> ${new Date().toLocaleString()}</p>
        ${
          lastBackup
            ? `
          <p><strong>Last Successful Backup:</strong> ${new Date(lastBackup.completed_at).toLocaleString()}</p>
          <p><strong>Records in Last Backup:</strong> ${lastBackup.record_count}</p>
        `
            : "<p><em>No previous successful backups found.</em></p>"
        }
        <p>Please check the logs and retry the backup manually if needed.</p>
      `

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@tektonstable.com",
        to: adminEmails,
        subject: "⚠️ Database Backup Failed - Action Required",
        html: emailHtml,
      })
    }

    console.log(`[v0] Backup ${status} email sent to ${adminEmails.length} admin(s)`)
  } catch (error) {
    console.error("[v0] Failed to send backup notification:", error)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
