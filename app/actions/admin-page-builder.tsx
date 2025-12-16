import { createClient } from "@/utils/supabase-client" // Assuming this is where createClient is declared
import resend from "resend" // Assuming this is where resend is declared
import { revalidatePath } from "next/cache" // Assuming this is where revalidatePath is declared

export async function approvePlasmiRequest(tenantId: string, projectId: string, apiToken: string) {
  const supabase = await createClient()

  try {
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("name, subdomain, primary_contact_email")
      .eq("id", tenantId)
      .single()

    if (tenantError || !tenant) {
      return { success: false, error: "Tenant not found" }
    }

    // Update tenant with Plasmic credentials
    const { error } = await supabase
      .from("tenants")
      .update({
        plasmic_project_id: projectId,
        plasmic_api_token: apiToken,
      })
      .eq("id", tenantId)

    if (error) {
      return { success: false, error: error.message }
    }

    try {
      await resend.emails.send({
        from: "Tekton's Table <notifications@tektonstable.com>",
        to: tenant.primary_contact_email || "admin@tektonstable.com",
        subject: "Your Custom Page Builder is Ready!",
        html: `
          <h2>Custom Page Builder Activated</h2>
          <p>Great news! Your custom page builder has been set up and is ready to use.</p>
          
          <h3>Getting Started:</h3>
          <ol>
            <li>Go to your admin dashboard at <a href="https://${tenant.subdomain}.tektonstable.com/admin">https://${tenant.subdomain}.tektonstable.com/admin</a></li>
            <li>Click on "Custom Pages" in the sidebar</li>
            <li>Click "Create New Page" to start building</li>
          </ol>
          
          <p>You'll be able to create and edit pages visually using the Plasmic editor.</p>
          
          <p>If you have any questions or need help getting started, please don't hesitate to reach out.</p>
          
          <p>Best regards,<br/>The Tekton's Table Team</p>
        `,
      })
    } catch (emailError) {
      console.error("[v0] Failed to send approval email:", emailError)
      // Don't fail the approval if email fails
    }

    revalidatePath("/admin/page-builder-requests")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error approving request:", error)
    return { success: false, error: "Failed to approve request" }
  }
}
