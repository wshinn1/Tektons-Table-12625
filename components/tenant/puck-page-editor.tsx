"use client"

import { Puck, Render } from "@measured/puck"
import "@measured/puck/puck.css"
import { createAiPlugin } from "@measured/puck-plugin-ai"
import "@measured/puck-plugin-ai/styles.css"
import { puckConfig } from "@/lib/puck-config"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PuckPageEditorProps {
  pageId?: string
  initialData?: any
  tenantId: string
  tenantSlug: string
  onSave?: (data: any) => Promise<void>
}

export function PuckPageEditor({ pageId, initialData, tenantId, tenantSlug, onSave }: PuckPageEditorProps) {
  console.log("[v0] PUCK EDITOR - Component rendering started")
  console.log("[v0] PUCK EDITOR - Props received:", { pageId, tenantId, tenantSlug, hasInitialData: !!initialData })
  console.log("[v0] PUCK EDITOR - NO PLASMIC CHECKS IN THIS COMPONENT")

  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const aiPlugin = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_PUCK_AI_KEY
    console.log("[v0] PUCK EDITOR - AI Key exists:", !!apiKey)
    if (!apiKey) {
      console.warn("[v0] Puck AI key not found. AI features will be disabled.")
      return null
    }
    return createAiPlugin({ apiKey })
  }, [])

  const configWithPlugins = useMemo(() => {
    console.log("[v0] PUCK EDITOR - Creating config with plugins:", { hasAiPlugin: !!aiPlugin })
    return {
      ...puckConfig,
      plugins: aiPlugin ? [aiPlugin] : [],
    }
  }, [aiPlugin])

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
        const response = await fetch(`/api/tenant/${tenantSlug}/pages${pageId ? `/${pageId}` : ""}`, {
          method: pageId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: JSON.stringify(data),
            tenant_id: tenantId,
          }),
        })

        if (!response.ok) throw new Error("Failed to save page")

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

  console.log("[v0] PUCK EDITOR - About to render Puck component")

  return (
    <div className="h-screen">
      <div className="bg-blue-500 text-white p-2 text-xs">DEBUG: PuckPageEditor component loaded successfully</div>
      <Puck config={configWithPlugins} data={initialData || defaultData} onPublish={handlePublish} />
    </div>
  )
}

// Render component for displaying published pages
export function PuckPageRender({ data }: { data: any }) {
  return <Render config={puckConfig} data={data} />
}
