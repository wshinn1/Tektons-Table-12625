"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function tenantSignOut(tenantSlug: string) {
  console.log("[v0] Tenant sign out initiated for:", tenantSlug)

  const supabase = await createClient()

  const { error } = await supabase.auth.signOut({ scope: "global" })

  if (error) {
    console.error("[v0] Logout error:", error)
  } else {
    console.log("[v0] Successfully signed out from Supabase")
  }

  await new Promise((resolve) => setTimeout(resolve, 100))

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  allCookies.forEach((cookie) => {
    if (
      cookie.name.startsWith("sb-") ||
      cookie.name.includes("auth") ||
      cookie.name.includes("supabase") ||
      cookie.name.includes("session")
    ) {
      try {
        // Clear for both root domain and subdomain
        cookieStore.delete({
          name: cookie.name,
          domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
          path: "/",
        })
        cookieStore.delete({
          name: cookie.name,
          path: "/",
        })
        console.log("[v0] Cleared cookie:", cookie.name)
      } catch (e) {
        console.error("[v0] Error clearing cookie:", cookie.name, e)
      }
    }
  })

  try {
    cookieStore.delete({
      name: `tenant-owner-${tenantSlug}`,
      domain: process.env.NODE_ENV === "production" ? ".tektonstable.com" : undefined,
      path: "/",
    })
  } catch (e) {
    // Ignore errors
  }

  revalidatePath(`/`, "layout")
  revalidatePath(`/admin`, "layout")

  console.log("[v0] Redirecting to tenant home: /")
  redirect(`/`)
}
