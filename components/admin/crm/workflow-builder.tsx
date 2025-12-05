"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Plus, Trash2, ArrowLeft, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkflowStep {
  step_number: number
  delay_hours: number
  email_subject: string
  email_content: string
}

interface WorkflowBuilderProps {
  workflow?: any
}

export function WorkflowBuilder({ workflow }: WorkflowBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: workflow?.name || "",
    description: workflow?.description || "",
    trigger_type: workflow?.trigger_type || "learn_more_signup",
  })

  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflow?.workflow_steps?.sort((a: any, b: any) => a.step_number - b.step_number) || [
      {
        step_number: 1,
        delay_hours: 0,
        email_subject: "",
        email_content: "",
      },
    ],
  )

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        delay_hours: 24,
        email_subject: "",
        email_content: "",
      },
    ])
  }

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      toast({
        title: "Cannot remove",
        description: "Workflow must have at least one step",
        variant: "destructive",
      })
      return
    }
    const newSteps = steps.filter((_, i) => i !== index)
    // Renumber steps
    setSteps(newSteps.map((step, i) => ({ ...step, step_number: i + 1 })))
  }

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  async function handleSave() {
    if (!formData.name) {
      toast({
        title: "Missing name",
        description: "Please provide a workflow name",
        variant: "destructive",
      })
      return
    }

    const invalidStep = steps.find((step) => !step.email_subject || !step.email_content)
    if (invalidStep) {
      toast({
        title: "Incomplete step",
        description: `Step ${invalidStep.step_number} is missing subject or content`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        steps,
      }

      const url = workflow ? `/api/admin/workflows/${workflow.id}` : "/api/admin/workflows"

      const res = await fetch(url, {
        method: workflow ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save workflow")

      toast({
        title: "Workflow saved",
        description: "Your email workflow has been saved successfully",
      })

      router.push("/admin/workflows")
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              placeholder="Welcome Series"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this workflow does..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="trigger">Trigger</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learn_more_signup">Learn More Signup</SelectItem>
                <SelectItem value="manual">Manual Enrollment</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">When should contacts be enrolled in this workflow?</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Email Sequence</h2>
          <Button onClick={addStep} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        {steps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Step {step.step_number}</CardTitle>
                </div>
                {steps.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {index > 0 && (
                <CardDescription>
                  Wait{" "}
                  <Input
                    type="number"
                    className="inline-block w-20 h-8 mx-1"
                    value={step.delay_hours}
                    onChange={(e) => updateStep(index, "delay_hours", Number.parseInt(e.target.value) || 0)}
                    min={0}
                  />{" "}
                  hours after previous email
                </CardDescription>
              )}
              {index === 0 && <CardDescription>Sent immediately when enrolled</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`subject-${index}`}>Email Subject</Label>
                <Input
                  id={`subject-${index}`}
                  placeholder="Welcome to Tekton's Table!"
                  value={step.email_subject}
                  onChange={(e) => updateStep(index, "email_subject", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`content-${index}`}>Email Content (HTML)</Label>
                <Textarea
                  id={`content-${index}`}
                  placeholder="<html>Your email content...</html>"
                  value={step.email_content}
                  onChange={(e) => updateStep(index, "email_content", e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
