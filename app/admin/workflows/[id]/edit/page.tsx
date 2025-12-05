import { Suspense } from "react"
import { WorkflowBuilder } from "@/components/admin/crm/workflow-builder"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isSuperAdmin } from "@/lib/auth"

export default async function EditWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isSuperAdmin())) {
    redirect("/admin")
  }

  const { data: workflow } = await supabase
    .from("email_workflows")
    .select(
      `
      *,
      workflow_steps (*)
    `,
    )
    .eq("id", id)
    .single()

  if (!workflow) {
    redirect("/admin/workflows")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Email Workflow</h1>
        <p className="text-muted-foreground mt-1">Update your automated email sequence</p>
      </div>

      <Suspense fallback={<div>Loading builder...</div>}>
        <WorkflowBuilder workflow={workflow} />
      </Suspense>
    </div>
  )
}
