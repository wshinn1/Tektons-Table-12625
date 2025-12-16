"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import { setTenantPlasmiCredentials } from "@/app/actions/tenant-settings"

interface PlasmiCredentialsFormProps {
  tenantId: string
  tenantName: string
  currentProjectId?: string | null
  currentApiToken?: string | null
  hasRequested: boolean
}

export function PlasmiCredentialsForm({
  tenantId,
  tenantName,
  currentProjectId,
  currentApiToken,
  hasRequested,
}: PlasmiCredentialsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectId, setProjectId] = useState(currentProjectId || "")
  const [apiToken, setApiToken] = useState(currentApiToken || "")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const hasCredentials = !!(currentProjectId && currentApiToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      const result = await setTenantPlasmiCredentials({
        tenantId,
        plasmic_project_id: projectId,
        plasmic_api_token: apiToken,
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || "Failed to save credentials")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Plasmic Page Builder Settings</span>
          {hasRequested && !hasCredentials && (
            <span className="text-sm font-normal text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Request Pending
            </span>
          )}
        </CardTitle>
        <CardDescription>Configure Plasmic visual page builder for {tenantName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Plasmic Project ID</Label>
            <Input
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter Plasmic Project ID"
              required
            />
            <p className="text-sm text-muted-foreground">
              Found in the URL: studio.plasmic.app/projects/YOUR_PROJECT_ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken">Plasmic API Token</Label>
            <Input
              id="apiToken"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter Plasmic API Token"
              type="password"
              required
            />
            <p className="text-sm text-muted-foreground">
              Click the "Code" button in Plasmic Studio to get your public API token
            </p>
          </div>

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Plasmic credentials saved successfully! The tenant has been notified via email.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hasCredentials ? "Update" : "Save"} Credentials
            </Button>

            <Button type="button" variant="outline" asChild>
              <a href="https://studio.plasmic.app" target="_blank" rel="noopener noreferrer">
                Open Plasmic Studio
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </form>

        {hasCredentials && (
          <Alert className="mt-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Plasmic is configured for this tenant. They can create pages at: https://
              {tenantName.toLowerCase().replace(/\s+/g, "")}.tektonstable.com/admin/pages/new
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
