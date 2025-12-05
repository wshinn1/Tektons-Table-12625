"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function updatePlatformFee(feePercentage: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("platform_settings")
    .update({ setting_value: feePercentage, updated_at: new Date().toISOString() })
    .eq("setting_key", "platform_fee_percentage")

  if (error) {
    throw new Error(error.message)
  }
}
