"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface PlasmiPageEditorProps {
  pageId?: string
  initialData?: any
  onSave?: (data: any) => void
}

export function PlasmiPageEditor({ pageId, initialData, onSave }: PlasmiPageEditorProps) {
  const [editorUrl, setEditorUrl] = useState<string>("")

  useEffect(() => {
    // Get the current host for the Plasmic editor
    const host = window.location.origin
    const hostPath = `${host}/plasmic-host`

    // Construct the Plasmic Studio URL with your project
    const projectId = process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID || ""
    const studioUrl = `https://studio.plasmic.app/projects/${projectId}?host=${encodeURIComponent(hostPath)}`

    setEditorUrl(studioUrl)
  }, [])

  const openEditor = () => {
    if (editorUrl) {
      window.open(editorUrl, "_blank")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
      <div className="max-w-2xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold">Plasmic Visual Editor</h1>

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
                  <code className="bg-muted px-1 rounded">{window.location.origin}/plasmic-host</code>
                </li>
              </ol>
            </div>

            {editorUrl && (
              <Button onClick={openEditor} size="lg">
                Open Plasmic Studio
              </Button>
            )}
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
