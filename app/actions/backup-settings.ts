"use server"

import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

interface BackupScheduleSettings {
  frequency: "daily" | "weekly" | "monthly"
  enabled: boolean
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
}

export async function updateBackupSchedule(settings: BackupScheduleSettings) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("platform_settings")
    .upsert({
      setting_key: "backup_schedule",
      setting_value: settings,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("setting_key", "backup_schedule")

  if (error) {
    throw new Error("Failed to update backup schedule")
  }

  revalidatePath("/admin/backups")
  return { success: true }
}

export async function getBackupSchedule() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("setting_value")
    .eq("setting_key", "backup_schedule")
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to fetch backup schedule")
  }

  return data?.setting_value as BackupScheduleSettings | null
}
