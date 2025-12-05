import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/auth"
import { PlatformRevenueManager } from "@/components/admin/platform-revenue-manager"

export const metadata = {
  title: "Platform Revenue - Admin",
  description: "Track platform revenue from tenant subscriptions and fees",
}

export default async function PlatformRevenuePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const isAdmin = await isSuperAdmin(user.id)
  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Revenue</h1>
        <p className="text-muted-foreground mt-2">
          Track payments from tenants and monitor platform financial performance
        </p>
      </div>

      <Suspense fallback={<div>Loading revenue data...</div>}>
        <PlatformRevenueManager />
      </Suspense>
    </div>
  )
}
