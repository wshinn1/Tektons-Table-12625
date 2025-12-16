"use client"

import { Puck, Render } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck-config"
import { useState } from "react"
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
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

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
      console.error("Error saving page:", error)
      toast.error("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen">
      <Puck config={puckConfig} data={initialData || defaultData} onPublish={handlePublish} />
    </div>
  )
}

// Render component for displaying published pages
export function PuckPageRender({ data }: { data: any }) {
  return <Render config={puckConfig} data={data} />
}
