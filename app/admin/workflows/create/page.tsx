import { Suspense } from "react"
import { WorkflowBuilder } from "@/components/admin/crm/workflow-builder"

export default function CreateWorkflowPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Email Workflow</h1>
        <p className="text-muted-foreground mt-1">Build automated email sequences for your contacts</p>
      </div>

      <Suspense fallback={<div>Loading builder...</div>}>
        <WorkflowBuilder />
      </Suspense>
    </div>
  )
}
