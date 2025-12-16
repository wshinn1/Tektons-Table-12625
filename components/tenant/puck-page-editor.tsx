"use client"
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck-config"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Sparkles, Layers, FileText } from "lucide-react"

interface PuckPageEditorProps {
  pageId?: string
  initialData?: any
  tenantId: string
  tenantSlug: string
  onSave?: (data: any) => Promise<void>
}

export function PuckPageEditor({ pageId, initialData, tenantId, tenantSlug, onSave }: PuckPageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"blocks" | "outline" | "ai">("blocks")

  const aiPromptRef = useRef<HTMLTextAreaElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)

  const defaultData = {
    content: [],
    root: { props: {} },
  }

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(data)
      } else {
        const url = pageId ? `/api/tenant/${tenantId}/pages/${pageId}` : `/api/tenant/${tenantId}/pages`

        console.log("[v0] Saving page to:", url)
        console.log("[v0] Tenant ID:", tenantId)

        const response = await fetch(url, {
          method: pageId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: data,
            tenant_id: tenantId,
          }),
        })

        const responseText = await response.text()
        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response body:", responseText)

        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = { error: responseText }
        }

        if (!response.ok) {
          console.error("[v0] Save error response:", responseData)
          throw new Error(responseData.error || responseData.details || "Failed to save page")
        }

        console.log("[v0] Page saved successfully:", responseData)
        toast.success("Page saved successfully!")
        router.push(`/${tenantSlug}/admin/pages`)
      }
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiGenerate = useCallback(async () => {
    const prompt = aiPromptRef.current?.value?.trim()
    if (!prompt) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setGeneratedContent(null)
    try {
      console.log("[v0] Generating content for prompt:", prompt)
      const response = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      console.log("[v0] AI response status:", response.status)
      const responseText = await response.text()
      console.log("[v0] AI response text:", responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText }
        }
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = JSON.parse(responseText)
      console.log("[v0] AI generated content:", data)
      setGeneratedContent(data)
      toast.success("Content generated! You can copy the suggestions below.")
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col fixed inset-0 z-50 bg-white">
      <Puck
        config={puckConfig}
        data={initialData || defaultData}
        onPublish={handlePublish}
        overrides={{
          drawer: ({ children }) => (
            <div className="flex flex-col h-full">
              {/* Custom tabs */}
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setActiveTab("blocks")}
                  className={`flex-1 px-3 py-2 text-xs font-medium flex flex-col items-center gap-1 ${
                    activeTab === "blocks"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Blocks
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("outline")}
                  className={`flex-1 px-3 py-2 text-xs font-medium flex flex-col items-center gap-1 ${
                    activeTab === "outline"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Outline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 px-3 py-2 text-xs font-medium flex flex-col items-center gap-1 ${
                    activeTab === "ai"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeTab === "blocks" && children}
                {activeTab === "outline" && (
                  <div className="p-4 text-sm text-gray-500">
                    <p className="font-medium mb-2">Page Outline</p>
                    <p className="text-xs">
                      Select a component on the canvas to see its position in the page structure.
                    </p>
                  </div>
                )}
                {activeTab === "ai" && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">AI Content Generator</label>
                      <textarea
                        ref={aiPromptRef}
                        placeholder="Describe what you want to create, e.g., 'A hero section with a heading about missions and a donation button'"
                        className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                        onKeyDown={(e) => {
                          // Prevent Puck from capturing keyboard events
                          e.stopPropagation()
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAiGenerate}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Content
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500">
                      AI will suggest content based on your description. You can then customize it in the editor.
                    </p>

                    {generatedContent && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Generated Suggestions:</p>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-48">
                          {JSON.stringify(generatedContent, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ),
        }}
      />
    </div>
  )
}

// Render component for displaying published pages
export { PuckPageRender } from "@/lib/puck-config"
