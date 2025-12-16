"use client"

import type React from "react"

import { Puck, Render } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck-config"
import { useState, useMemo } from "react"
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
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<"blocks" | "outline" | "fields" | "ai">("blocks")

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
        const response = await fetch(`/api/tenant/${tenantId}/pages${pageId ? `/${pageId}` : ""}`, {
          method: pageId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: data,
            tenant_id: tenantId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("[v0] Save error:", errorData)
          throw new Error(errorData.error || "Failed to save page")
        }

        toast.success("Page saved successfully!")
        router.push(`/${tenantSlug}/admin/pages`)
      }
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      toast.error("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      if (!response.ok) throw new Error("Failed to generate content")

      const data = await response.json()
      toast.success("Content generated! Drag blocks from the panel.")
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast.error("Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  const overrides = useMemo(
    () => ({
      headerActions: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }),
    [],
  )

  return (
    <div className="h-screen flex flex-col">
      <Puck
        config={puckConfig}
        data={initialData || defaultData}
        onPublish={handlePublish}
        overrides={{
          // Add AI tab to the component list sidebar
          components: ({ children }) => (
            <div className="flex flex-col h-full">
              {/* Custom tabs */}
              <div className="flex border-b border-gray-200 bg-white">
                <button
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
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe what you want to create, e.g., 'A hero section with a heading about missions and a donation button'"
                        className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-spin">⟳</span>
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
export function PuckPageRender({ data }: { data: any }) {
  return <Render config={puckConfig} data={data} />
}
