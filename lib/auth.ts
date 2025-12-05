import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin as checkSuperAdmin } from "@/lib/supabase/admin"

/**
 * Check if the current authenticated user is a super admin
 * This is a convenience wrapper that gets the current user and checks their admin status
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    return await checkSuperAdmin(user.id)
  } catch (error) {
    console.error("Error checking super admin status:", error)
    return false
  }
}

/**
 * Check if a specific user ID is a super admin
 */
export async function isSuperAdminById(userId: string): Promise<boolean> {
  return await checkSuperAdmin(userId)
}

// Re-export for convenience
export { isSuperAdmin as default }
