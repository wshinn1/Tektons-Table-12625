"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Zap, Edit, Users, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Workflow {
  id: string
  name: string
  description: string
  trigger_type: string
  is_active: boolean
  step_count: number
  enrollment_count: number
  created_at: string
}

export function WorkflowsManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/admin/workflows")
      if (!res.ok) throw new Error("Failed to fetch workflows")
      const data = await res.json()
      setWorkflows(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/workflows/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!res.ok) throw new Error("Failed to toggle workflow")

      toast({
        title: "Success",
        description: `Workflow ${!isActive ? "activated" : "paused"}`,
      })

      fetchWorkflows()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      })
    }
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case "learn_more_signup":
        return "Learn More Signup"
      case "group_join":
        return "Group Join"
      default:
        return "Manual"
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading workflows...</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => router.push("/admin/workflows/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-6">Create automated email sequences to engage your contacts</p>
            <Button onClick={() => router.push("/admin/workflows/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <Badge variant="outline">{getTriggerLabel(workflow.trigger_type)}</Badge>
                    {workflow.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>

                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Steps: </span>
                      <span className="font-medium">{workflow.step_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Enrolled: </span>
                      <span className="font-medium">{workflow.enrollment_count}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{workflow.is_active ? "Active" : "Paused"}</span>
                    <Switch
                      checked={workflow.is_active}
                      onCheckedChange={() => toggleWorkflow(workflow.id, workflow.is_active)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/workflows/${workflow.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
