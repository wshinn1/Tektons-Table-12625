import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmailRecipientsSettings } from "@/components/tenant/admin/email-recipients-settings"
import { DangerZoneSettings } from "@/components/tenant/admin/danger-zone-settings"
import { CampaignNotificationSettings } from "@/components/tenant/admin/campaign-notification-settings"
import { BlogWidgetSettings } from "@/components/tenant/admin/blog-widget-settings"
import { HomepageWidgetSettings } from "@/components/tenant/admin/homepage-widget-settings"
import { BrandingSettings } from "@/components/tenant/admin/branding-settings"
import { emailsMatch } from "@/lib/utils"

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${tenantSlug}`)
  }

  const { data: tenant } = await supabase.from("tenants").select("*").eq("subdomain", tenantSlug).single()

  if (!tenant || !emailsMatch(tenant.email, user.email)) {
    redirect(`/${tenantSlug}`)
  }

  const { data: givingSettings } = await supabase
    .from("tenant_giving_settings")
    .select("blog_widget_preference, homepage_widget_preference")
    .eq("tenant_id", tenant.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings and preferences</p>
      </div>

      <div className="space-y-8">
        <BrandingSettings
          tenantId={tenant.id}
          currentFaviconUrl={tenant.favicon_url}
          currentOgImageUrl={tenant.og_image_url}
          currentSiteTitle={tenant.site_title}
          currentSiteDescription={tenant.site_description}
          tenantName={tenant.full_name || tenant.subdomain}
        />

        <EmailRecipientsSettings
          tenantId={tenant.id}
          currentRecipients={tenant.contact_email_recipients || []}
          primaryEmail={tenant.contact_email}
        />

        <CampaignNotificationSettings
          tenantId={tenant.id}
          currentPreference={tenant.campaign_notification_preference || "immediate"}
        />

        <HomepageWidgetSettings
          tenantId={tenant.id}
          currentPreference={givingSettings?.homepage_widget_preference || "giving"}
        />

        <BlogWidgetSettings
          tenantId={tenant.id}
          currentPreference={givingSettings?.blog_widget_preference || "giving"}
        />

        <DangerZoneSettings tenantId={tenant.id} />
      </div>
    </div>
  )
}
