"use client"
import { Puck } from "@measured/puck"
import { createAiPlugin } from "@puckeditor/plugin-ai"
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer"
import { createPuckConfig } from "@/lib/puck-config"
import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

function loadPuckStyles() {
  if (typeof window === "undefined") return

  // Check if styles are already loaded
  if (document.getElementById("puck-main-css")) return

  // Create link elements for Puck CSS files from CDN
  const cssFiles = [
    { id: "puck-main-css", href: "https://unpkg.com/@measured/puck@0.21.0-canary.c0db75c1/puck.css" },
    { id: "puck-ai-css", href: "https://unpkg.com/@puckeditor/plugin-ai@0.4.0/styles.css" },
    {
      id: "puck-heading-css",
      href: "https://unpkg.com/@measured/puck-plugin-heading-analyzer@0.21.0-canary.c0db75c1/dist/index.css",
    },
  ]

  cssFiles.forEach(({ id, href }) => {
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href = href
    document.head.appendChild(link)
  })
}

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
  pageTitle: initialPageTitle,
  pageSlug: initialPageSlug,
  onSave,
}: PuckPageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [puckKey, setPuckKey] = useState(0)
  const [currentTitle, setCurrentTitle] = useState(initialPageTitle || "Page")

  const latestDataRef = useRef(initialData || { content: [], root: { props: { title: "Page" } }, zones: {} })

  const isSubdomain =
    typeof window !== "undefined" &&
    window.location.hostname.includes(".") &&
    !window.location.hostname.startsWith("localhost") &&
    window.location.hostname.split(".")[0] !== "www" &&
    window.location.hostname.split(".")[0] !== "tektonstable"

  const config = useMemo(() => {
    console.log("[v0] Creating Puck config for tenant:", tenantId)
    return createPuckConfig(tenantId)
  }, [tenantId])

  const aiPlugin = useMemo(() => {
    console.log("[v0] Creating AI plugin with proxyUrl: /api/puck")
    const plugin = createAiPlugin({
      proxyUrl: "/api/puck",
    })
    console.log("[v0] AI plugin created:", plugin)
    console.log("[v0] AI plugin type:", typeof plugin)
    console.log("[v0] AI plugin keys:", plugin ? Object.keys(plugin) : "null")
    return plugin
  }, [])

  const handleChange = (data: any) => {
    console.log("[v0] Puck onChange called")
    console.log(
      "[v0] Data received:",
      data
        ? {
            contentLength: data.content?.length,
            hasRoot: !!data.root,
            hasZones: !!data.zones,
          }
        : "null",
    )
    if (data && typeof data === "object") {
      latestDataRef.current = data
      console.log("[v0] Updated latestDataRef with", data.content?.length, "blocks")

      const newTitle = data.root?.props?.title
      if (newTitle && newTitle !== currentTitle) {
        setCurrentTitle(newTitle)
      }
    }
  }

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(data)
      } else {
        const url = pageId ? `/api/tenant/${tenantId}/pages/${pageId}` : `/api/tenant/${tenantId}/pages`

        const puckTitle = data.root?.props?.title || initialPageTitle || `Page ${Date.now()}`
        const generatedSlug = generateSlug(puckTitle)

        const payload = pageId
          ? {
              title: puckTitle,
              slug: generatedSlug, // Always use generated slug from current title
              design_json: data,
              status: "published",
            }
          : {
              title: puckTitle,
              slug: generatedSlug,
              design_json: data,
              tenant_id: tenantId,
              status: "published",
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
        const redirectPath = isSubdomain ? "/admin/pages" : `/${tenantSlug}/admin/pages`
        router.push(redirectPath)
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const stableInitialData = useMemo(() => {
    const data = initialData || { content: [], root: { props: { title: "Page" } }, zones: {} }
    console.log("[v0] stableInitialData computed:", {
      contentLength: data.content?.length,
      hasRoot: !!data.root,
    })
    return data
  }, []) // Empty deps - only compute once on mount

  useEffect(() => {
    loadPuckStyles()
    console.log("[v0] Puck styles loaded")
  }, [])

  console.log("[v0] PuckPageEditor rendering with:", {
    tenantId,
    pageId,
    hasConfig: !!config,
    hasAiPlugin: !!aiPlugin,
    puckKey,
  })

  return (
    <Puck
      key={puckKey}
      config={config}
      data={stableInitialData}
      onChange={handleChange}
      onPublish={handlePublish}
      plugins={[aiPlugin, headingAnalyzer]}
      iframe={{ enabled: true }}
      headerTitle={currentTitle}
      onAction={(action, appState, prevAppState) => {
        console.log("[v0] Puck onAction:", action.type)
        console.log("[v0] appState exists:", !!appState)
        console.log("[v0] prevAppState exists:", !!prevAppState)
        if (appState?.data) {
          console.log("[v0] appState.data.content length:", appState.data.content?.length)
        }
      }}
    />
  )
}

export { PuckPageRender } from "@/lib/puck-config"
