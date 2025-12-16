"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface PlasmiPageEditorProps {
  pageId?: string
  initialData?: any
  onSave?: (data: any) => void
  tenantProjectId: string | null
  tenantApiToken: string | null
  tenantSlug: string
}

export function PlasmiPageEditor({
  pageId,
  initialData,
  onSave,
  tenantProjectId,
  tenantApiToken,
  tenantSlug,
}: PlasmiPageEditorProps) {
  const [editorUrl, setEditorUrl] = useState<string>("")
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const projectId = tenantProjectId || ""
    const apiToken = tenantApiToken || ""

    console.log("[v0] Plasmic Project ID exists:", !!projectId)
    console.log("[v0] Plasmic API Token exists:", !!apiToken)

    setIsConfigured(!!projectId && !!apiToken)

    if (projectId && apiToken) {
      // Get the current host for the Plasmic editor
      const host = window.location.origin
      const hostPath = `${host}/plasmic-host`

      // Construct the Plasmic Studio URL with your project
      const studioUrl = `https://studio.plasmic.app/projects/${projectId}?host=${encodeURIComponent(hostPath)}`

      setEditorUrl(studioUrl)
    }
  }, [tenantProjectId, tenantApiToken])

  const openEditor = () => {
    if (editorUrl) {
      window.open(editorUrl, "_blank")
    }
  }

  if (isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="max-w-2xl w-full space-y-6 text-center">
          <h1 className="text-4xl font-bold">Plasmic Visual Editor</h1>

          <div className="bg-card p-6 rounded-lg border space-y-4">
            <p className="text-muted-foreground">
              Your Plasmic editor is configured and ready to use. Click the button below to open Plasmic Studio and
              start editing your pages.
            </p>

            <Button onClick={openEditor} size="lg" className="mt-4">
              Open Plasmic Studio
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Plasmic Studio opens in a new window</li>
              <li>The editor loads your site within an iframe for real-time editing</li>
              <li>Changes are saved to your Plasmic project</li>
              <li>Your site fetches and renders the content via the Plasmic API</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="max-w-2xl w-full space-y-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
          <h1 className="text-4xl font-bold">Plasmic Setup Required</h1>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-4">
          <p className="text-muted-foreground">
            To use the Plasmic visual editor, you need to configure your Plasmic project credentials in your Settings.
          </p>

          <Button onClick={() => (window.location.href = `/${tenantSlug}/admin/settings`)} size="lg">
            Go to Settings
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">What you'll need:</h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
            <li>A Plasmic account (free at studio.plasmic.app)</li>
            <li>Your Plasmic Project ID</li>
            <li>Your Plasmic API Token</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
