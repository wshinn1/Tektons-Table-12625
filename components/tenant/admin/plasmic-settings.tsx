"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updatePlasmiSettings } from "@/app/actions/tenant-settings"
import { toast } from "@/hooks/use-toast"
import { ExternalLink } from "lucide-react"

interface PlasmiSettingsProps {
  tenantId: string
  currentProjectId: string | null
  currentApiToken: string | null
}

export function PlasmiSettings({ tenantId, currentProjectId, currentApiToken }: PlasmiSettingsProps) {
  const [projectId, setProjectId] = useState(currentProjectId || "")
  const [apiToken, setApiToken] = useState(currentApiToken || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get tenant subdomain from URL
      const tenantSlug = window.location.pathname.split("/")[1]

      const result = await updatePlasmiSettings(tenantSlug, projectId || null, apiToken || null)

      if (result.success) {
        toast({
          title: "Success",
          description: "Plasmic settings updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update Plasmic settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plasmic Visual Editor</CardTitle>
        <CardDescription>Configure your Plasmic project for visual page building</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="plasmic_project_id">Plasmic Project ID</Label>
          <Input
            id="plasmic_project_id"
            type="text"
            placeholder="Enter your Plasmic project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Find this in your Plasmic Studio URL: studio.plasmic.app/projects/[PROJECT_ID]
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plasmic_api_token">Plasmic API Token</Label>
          <Input
            id="plasmic_api_token"
            type="password"
            placeholder="Enter your Plasmic API token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Click the "Code" button in Plasmic Studio to find your public API token
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">Setup Instructions:</h4>
          <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>
              Create a project at{" "}
              <a
                href="https://studio.plasmic.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                studio.plasmic.app <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Copy your Project ID from the URL and API Token from Settings</li>
            <li>Paste them above and save</li>
            <li>
              Configure your app host URL in Plasmic to:{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                {typeof window !== "undefined" ? window.location.origin : ""}/plasmic-host
              </code>
            </li>
          </ol>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Plasmic Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
