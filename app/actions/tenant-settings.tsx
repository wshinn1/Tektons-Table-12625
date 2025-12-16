"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestPageBuilder(tenantSubdomain: string) {
  const supabase = await createClient()

  try {
    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, subdomain, primary_contact_email, page_builder_requested")
      .eq("subdomain", tenantSubdomain)
      .single()

    if (tenantError || !tenant) {
      return { success: false, error: "Tenant not found" }
    }

    // Check if already requested
    if (tenant.page_builder_requested) {
      return { success: false, error: "Page builder already requested" }
    }

    // Update tenant to mark request
    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        page_builder_requested: true,
        page_builder_requested_at: new Date().toISOString(),
      })
      .eq("subdomain", tenantSubdomain)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: "Tekton's Table <notifications@tektonstable.com>",
        to: process.env.ADMIN_EMAIL || "admin@tektonstable.com",
        subject: `Custom Page Builder Request - ${tenant.name}`,
        html: `
          <h2>New Custom Page Builder Request</h2>
          <p>A tenant has requested access to the custom page builder.</p>
          <h3>Tenant Details:</h3>
          <ul>
            <li><strong>Tenant Name:</strong> ${tenant.name}</li>
            <li><strong>Subdomain:</strong> ${tenant.subdomain}</li>
            <li><strong>Contact Email:</strong> ${tenant.primary_contact_email || "Not provided"}</li>
            <li><strong>Requested At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <h3>Next Steps:</h3>
          <ol>
            <li>Create a new Plasmic project at <a href="https://studio.plasmic.app">studio.plasmic.app</a></li>
            <li>Get the Project ID and API Token from Plasmic</li>
            <li>Update the tenant's Plasmic credentials in the database:
              <pre>
UPDATE tenants 
SET plasmic_project_id = 'PROJECT_ID',
    plasmic_api_token = 'API_TOKEN'
WHERE subdomain = '${tenant.subdomain}';
              </pre>
            </li>
            <li>Configure the app host URL in Plasmic to: https://${tenant.subdomain}.tektonstable.com/plasmic-host</li>
          </ol>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Failed to send email notification:", emailError)
      // Don't fail the request if email fails
    }

    revalidatePath(`/${tenantSubdomain}/admin/settings`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error requesting page builder:", error)
    return { success: false, error: "Failed to request page builder" }
  }
}

export async function updatePlasmiSettings(
  tenantSubdomain: string,
  plasmic_project_id: string | null,
  plasmic_api_token: string | null,
) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from("tenants")
      .update({
        plasmic_project_id,
        plasmic_api_token,
      })
      .eq("subdomain", tenantSubdomain)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath(`/${tenantSubdomain}/admin/settings`)
    revalidatePath(`/${tenantSubdomain}/admin/pages`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating Plasmic settings:", error)
    return { success: false, error: "Failed to update Plasmic settings" }
  }
}
