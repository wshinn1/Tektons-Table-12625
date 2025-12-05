import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ReferralProgramToggle } from "@/components/admin/referral-program-toggle"
import { SystemSettingsCard } from "@/components/admin/system-settings-card"
import { PlatformStripeConnectCard } from "@/components/admin/platform-stripe-connect-card"
import { getPlatformStripeStatus } from "@/app/actions/platform-stripe"

export default async function AdminSettings() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  const { data: currentFeeConfig } = await supabase
    .from("platform_fee_config")
    .select("*")
    .order("effective_date", { ascending: false })
    .limit(1)
    .single()

  const { data: referralSettings } = await supabase.from("referral_program_settings").select("*").limit(1).single()

  const { data: systemSettings } = await supabase
    .from("system_settings")
    .select("*")
    .in("setting_key", ["maintenance_mode", "new_signups_enabled", "email_notifications_enabled"])

  const stripeStatus = await getPlatformStripeStatus()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div>
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">Platform Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>
              Configure site title, favicon, and social sharing settings for tektonstable.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings/site">
              <button className="text-primary hover:underline">Manage Site Settings →</button>
            </Link>
          </CardContent>
        </Card>

        {/* New Page Metadata Settings card */}
        <Card>
          <CardHeader>
            <CardTitle>Page Metadata Settings</CardTitle>
            <CardDescription>Customize social sharing and SEO metadata for individual pages</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings/pages">
              <button className="text-primary hover:underline">Manage Page Metadata →</button>
            </Link>
          </CardContent>
        </Card>

        <PlatformStripeConnectCard
          connected={stripeStatus.connected}
          accountId={stripeStatus.accountId}
          accountEmail={stripeStatus.accountEmail}
          connectedAt={stripeStatus.connectedAt}
        />

        <Card>
          <CardHeader>
            <CardTitle>Platform Fee Management</CardTitle>
            <CardDescription>
              Current base fee: <strong>{currentFeeConfig?.base_fee_percentage.toFixed(2)}%</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/settings/platform-fee">
              <button className="text-primary hover:underline">Manage Platform Fee →</button>
            </Link>
          </CardContent>
        </Card>

        <ReferralProgramToggle
          isEnabled={referralSettings?.is_enabled || false}
          welcomeDiscount={referralSettings?.welcome_discount_percentage || 2.5}
        />

        <SystemSettingsCard settings={systemSettings || []} />
      </div>
    </div>
  )
}
