"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface PlasmiPageEditorProps {
  pageId?: string
  initialData?: any
  onSave?: (data: any) => void
}

export function PlasmiPageEditor({ pageId, initialData, onSave }: PlasmiPageEditorProps) {
  const [editorUrl, setEditorUrl] = useState<string>("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [projectId, setProjectId] = useState("")
  const [apiToken, setApiToken] = useState("")

  useEffect(() => {
    const envProjectId = process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || ""
    const envApiToken = process.env.NEXT_PUBLIC_PLASMIC_API_TOKEN || ""

    console.log("[v0] Plasmic Project ID exists:", !!envProjectId)
    console.log("[v0] Plasmic API Token exists:", !!envApiToken)

    setProjectId(envProjectId)
    setApiToken(envApiToken)
    setIsConfigured(!!envProjectId && !!envApiToken)

    if (envProjectId && envApiToken) {
      // Get the current host for the Plasmic editor
      const host = window.location.origin
      const hostPath = `${host}/plasmic-host`

      // Construct the Plasmic Studio URL with your project
      const studioUrl = `https://studio.plasmic.app/projects/${envProjectId}?host=${encodeURIComponent(hostPath)}`

      setEditorUrl(studioUrl)
    }
  }, [])

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
            Plasmic requires a project to be set up in your Plasmic account. Once configured, you can edit pages
            visually in Plasmic Studio.
          </p>

          <div className="space-y-4">
            <div className="text-left space-y-2">
              <h3 className="font-semibold">Setup Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href="https://studio.plasmic.app"
                    target="_blank"
                    className="text-primary underline"
                    rel="noreferrer"
                  >
                    studio.plasmic.app
                  </a>{" "}
                  and create a project
                </li>
                <li>Copy your Project ID and API Token from Settings</li>
                <li>
                  Add them to your environment variables:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>NEXT_PUBLIC_PLASMIC_PROJECT_ID</li>
                    <li>NEXT_PUBLIC_PLASMIC_API_TOKEN</li>
                  </ul>
                </li>
                <li>
                  Configure your app host URL in Plasmic:{" "}
                  <code className="bg-muted px-1 rounded text-xs">
                    {typeof window !== "undefined" ? window.location.origin : "https://wesshinn.tektonstable.com"}
                    /plasmic-host
                  </code>
                </li>
              </ol>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Missing Configuration:</h4>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                {!projectId && <li>• NEXT_PUBLIC_PLASMIC_PROJECT_ID is not set</li>}
                {!apiToken && <li>• NEXT_PUBLIC_PLASMIC_API_TOKEN is not set</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Note: External Editor</h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Plasmic Studio opens in a separate window. The editor loads your site within the /plasmic-host page to
            provide real-time editing capabilities.
          </p>
        </div>
      </div>
    </div>
  )
}
