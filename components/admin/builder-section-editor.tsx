"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Plus, RefreshCw } from "lucide-react"
import { useState } from "react"

interface BuilderSectionEditorProps {
  sectionId: string
  sectionName: string
  builderContentId?: string // The actual Builder.io content ID if it exists
  onUpdate?: (builderContentId: string) => void
}

export function BuilderSectionEditor({
  sectionId,
  sectionName,
  builderContentId,
  onUpdate,
}: BuilderSectionEditorProps) {
  const [isCreating, setIsCreating] = useState(false)

  // To create new content, go to the Content page with model pre-selected
  const createUrl = `https://builder.io/content?model=section`

  // To edit existing content, use the actual content ID
  const editUrl = builderContentId ? `https://builder.io/content/${builderContentId}` : null

  const handleCreate = () => {
    setIsCreating(true)
    // Open Builder.io in new tab to create content
    window.open(createUrl, "_blank")
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <h4 className="font-semibold">Builder.io Section: {sectionName}</h4>
        <p className="text-sm text-muted-foreground">
          {builderContentId
            ? "Edit this section in Builder.io's visual editor."
            : "Create this section in Builder.io's visual editor, then paste the Content ID below."}
        </p>
      </div>

      {builderContentId ? (
        // Has existing content - show edit button
        <Button asChild>
          <a href={editUrl!} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Edit in Builder.io
          </a>
        </Button>
      ) : (
        // No content yet - show create flow
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button onClick={handleCreate} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Create in Builder.io
            </Button>

            {isCreating && (
              <div className="space-y-3 p-4 bg-background border rounded-lg">
                <p className="text-sm font-medium">After creating your section in Builder.io:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Design your section using the visual editor</li>
                  <li>Click "Publish" in Builder.io</li>
                  <li>
                    Copy the Content ID from the URL (e.g., builder.io/content/<strong>abc123</strong>)
                  </li>
                  <li>Paste it in the field below</li>
                </ol>

                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Paste Builder.io Content ID here..."
                    className="flex-1 px-3 py-2 text-sm border rounded-md"
                    onChange={(e) => {
                      const id = e.target.value.trim()
                      if (id && onUpdate) {
                        onUpdate(id)
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground pt-4 border-t flex items-center gap-2">
        <RefreshCw className="w-3 h-3" />
        After making changes in Builder.io, refresh this page to see updates.
      </div>
    </div>
  )
}
