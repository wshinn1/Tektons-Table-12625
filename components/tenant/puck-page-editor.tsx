"use client"
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { createAiPlugin } from "@puckeditor/plugin-ai"
import "@puckeditor/plugin-ai/styles.css"
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer"
import "@measured/puck-plugin-heading-analyzer/dist/index.css"
import { createPuckConfig } from "@/lib/puck-config"
import { useState, useMemo, useCallback, useEffect, useRef } from "react"
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
  const dataUpdateCountRef = useRef(0)

  const [puckData, setPuckData] = useState(() => {
    const data = initialData || { content: [], root: { props: { title: "Page" } } }
    console.log("[v0] ========== PUCK INITIALIZATION ==========")
    console.log("[v0] Initial Puck data:", JSON.stringify(data, null, 2))
    console.log("[v0] Has root:", !!data.root)
    console.log("[v0] Has content:", !!data.content)
    console.log("[v0] Content is array:", Array.isArray(data.content))
    return data
  })

  const config = useMemo(() => {
    console.log("[v0] Creating Puck config for tenant:", tenantId)
    return createPuckConfig(tenantId)
  }, [tenantId])

  const aiPlugin = useMemo(() => {
    console.log("[v0] ========== AI PLUGIN INITIALIZATION ==========")
    console.log("[v0] Creating AI plugin with proxyUrl: /api/puck")
    return createAiPlugin({
      proxyUrl: "/api/puck",
    })
  }, [])

  useEffect(() => {
    if (initialData) {
      console.log("[v0] ========== INITIAL DATA CHANGED ==========")
      console.log("[v0] New initial data:", JSON.stringify(initialData, null, 2))
      setPuckData(initialData)
    }
  }, [initialData])

  const handleChange = useCallback((data: any) => {
    dataUpdateCountRef.current += 1
    console.log("[v0] ========== PUCK onChange CALLED ==========")
    console.log("[v0] Update count:", dataUpdateCountRef.current)
    console.log("[v0] Received data type:", typeof data)
    console.log("[v0] Received data:", JSON.stringify(data, null, 2))
    console.log("[v0] Data structure validation:")
    console.log("[v0]   - Has root:", !!data?.root)
    console.log("[v0]   - Has content:", !!data?.content)
    console.log("[v0]   - Content is array:", Array.isArray(data?.content))
    console.log("[v0]   - Content length:", Array.isArray(data?.content) ? data.content.length : 0)

    if (Array.isArray(data?.content)) {
      console.log(
        "[v0]   - Content items:",
        data.content.map((item: any, idx: number) => ({
          index: idx,
          type: item.type,
          hasProps: !!item.props,
          propsKeys: item.props ? Object.keys(item.props) : [],
        })),
      )
    }

    if (data && typeof data === "object") {
      const normalizedData = {
        root: data.root || { props: { title: "Page" } },
        content: Array.isArray(data.content) ? data.content : [],
        zones: data.zones || {},
      }

      console.log("[v0] Setting normalized data:", JSON.stringify(normalizedData, null, 2))
      console.log("[v0] Normalized data validation:")
      console.log("[v0]   - Has root:", !!normalizedData.root)
      console.log("[v0]   - Has content:", !!normalizedData.content)
      console.log("[v0]   - Has zones:", !!normalizedData.zones)
      console.log("[v0]   - Content length:", normalizedData.content.length)

      setPuckData(normalizedData)
      console.log("[v0] ========== onChange COMPLETE ==========")
    } else {
      console.error("[v0] ========== INVALID DATA STRUCTURE ==========")
      console.error("[v0] Received:", data)
      console.error("[v0] Type:", typeof data)
    }
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

  console.log("[v0] ========== RENDERING PUCK COMPONENT ==========")
  console.log("[v0] Current puckData:", JSON.stringify(puckData, null, 2))
  console.log("[v0] Config exists:", !!config)
  console.log("[v0] AI plugin exists:", !!aiPlugin)

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
