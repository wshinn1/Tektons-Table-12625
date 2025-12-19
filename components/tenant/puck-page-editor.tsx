"use client"
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { createAiPlugin } from "@puckeditor/plugin-ai"
import "@puckeditor/plugin-ai/styles.css"
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer"
import "@measured/puck-plugin-heading-analyzer/dist/index.css"
import { createPuckConfig } from "@/lib/puck-config"
import { useState, useMemo, useRef } from "react"
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

  const latestDataRef = useRef(initialData || { content: [], root: { props: { title: "Page" } }, zones: {} })

  const config = useMemo(() => createPuckConfig(tenantId), [tenantId])

  const aiPlugin = useMemo(
    () =>
      createAiPlugin({
        proxyUrl: "/api/puck",
      }),
    [],
  )

  const handleChange = (data: any) => {
    if (data && typeof data === "object") {
      latestDataRef.current = data
    }
  }

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    try {
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
      console.error("Error saving page:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const stableInitialData = useMemo(
    () => initialData || { content: [], root: { props: { title: "Page" } }, zones: {} },
    [], // Empty deps - only compute once on mount
  )

  return (
    <Puck
      config={config}
      data={stableInitialData}
      onChange={handleChange}
      onPublish={handlePublish}
      plugins={[aiPlugin, headingAnalyzer]}
      iframe={{ enabled: true }}
      headerTitle={pageTitle || "Page"}
    />
  )
}

export { PuckPageRender } from "@/lib/puck-config"
