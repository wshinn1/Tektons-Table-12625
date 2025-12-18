"use client"
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { createAiPlugin } from "@puckeditor/plugin-ai"
import "@puckeditor/plugin-ai/styles.css"
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer"
import "@measured/puck-plugin-heading-analyzer/dist/index.css"
import { createPuckConfig } from "@/lib/puck-config"
import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PuckPageEditorProps {
  pageId?: string
  initialData?: any
  tenantId: string
  tenantSlug: string
  pageTitle?: string
  pageSlug?: string
  onSave?: (data: any) => Promise<void>
}

export function PuckPageEditor({
  pageId,
  initialData,
  tenantId,
  tenantSlug,
  pageTitle,
  pageSlug,
  onSave,
}: PuckPageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [puckData, setPuckData] = useState(() => initialData || { content: [], root: {} })

  const config = useMemo(() => createPuckConfig(tenantId), [tenantId])

  const aiPlugin = useMemo(
    () =>
      createAiPlugin({
        proxyUrl: "/api/puck",
      }),
    [],
  )

  const handleChange = useCallback((data: any) => {
    console.log("[v0] Puck data changed:", data)
    setPuckData(data)
  }, [])

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    try {
      console.log("[v0] Publishing page with data:", data)

      if (onSave) {
        await onSave(data)
      } else {
        const url = pageId ? `/api/tenant/${tenantId}/pages/${pageId}` : `/api/tenant/${tenantId}/pages`

        const payload = pageId
          ? {
              design_json: data,
              status: "published",
            }
          : {
              title: pageTitle || `Page ${Date.now()}`,
              slug: pageSlug || `page-${Date.now()}`,
              design_json: data,
              tenant_id: tenantId,
              status: "draft",
            }

        const response = await fetch(url, {
          method: pageId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const responseText = await response.text()
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = { error: responseText }
        }

        if (!response.ok) {
          throw new Error(responseData.error || responseData.details || "Failed to save page")
        }

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

  return (
    <Puck
      config={config}
      data={puckData}
      onChange={handleChange}
      onPublish={handlePublish}
      plugins={[aiPlugin, headingAnalyzer]}
      iframe={{ enabled: true }}
      headerTitle={pageTitle || "Page"}
    />
  )
}

export { PuckPageRender } from "@/lib/puck-config"
