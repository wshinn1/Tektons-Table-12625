import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { isSuperAdmin } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"

export default async function PlatformStripeCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin(user.id))) {
    redirect("/auth/login")
  }

  if (params.error) {
    redirect(`/admin/settings?error=${params.error}`)
  }

  if (!params.code || params.state !== "platform_connect") {
    redirect("/admin/settings?error=invalid_request")
  }

  try {
    // Exchange the authorization code for an access token
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: params.code,
    })

    // Save the connected account ID to platform settings
    const { error } = await supabase
      .from("platform_settings")
      .update({
        stripe_account_id: response.stripe_user_id,
        stripe_account_email: response.stripe_user_id, // Stripe doesn't return email in OAuth response
        stripe_connected_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) {
      console.error("Error saving Stripe account:", error)
      redirect("/admin/settings?error=database_error")
    }

    redirect("/admin/settings?success=stripe_connected")
  } catch (error) {
    console.error("Error exchanging code:", error)
    redirect("/admin/settings?error=stripe_oauth_failed")
  }
}
