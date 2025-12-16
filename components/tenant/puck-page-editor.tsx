"use client"

import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { puckConfig } from "@/lib/puck-config"
import { useState } from "react"
import { useRouter } from 'next/navigation'

interface PuckPageEditorProps {
  pageId?: string
  initialData?: any
  tenantId: string
  tenantSlug: string
}

export function PuckPageEditor({ pageId, initialData, tenantId, tenantSlug }: PuckPageEditorProps) {
  console.log("[v0] PUCK EDITOR COMPONENT LOADED - NO PLASMIC CHECKS!")
  console.log("[v0] Props:", { pageId, tenantId, tenantSlug, hasInitialData: !!initialData })
  
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const defaultData = {
    content: [],
    root: { props: {} },
  }

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    console.log("[v0] Saving page data")
    
    try {
      const response = await fetch(`/api/tenant/${tenantSlug}/pages${pageId ? `/${pageId}` : ""}`, {
        method: pageId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify(data),
          tenant_id: tenantId,
        }),
      })

      if (!response.ok) throw new Error("Failed to save")
      
      console.log("[v0] Saved successfully!")
      router.push(`/${tenantSlug}/admin/pages`)
    } catch (error) {
      console.error("[v0] Save error:", error)
      alert("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen">
      <Puck 
        config={puckConfig} 
        data={initialData || defaultData} 
        onPublish={handlePublish} 
      />
    </div>
  )
}
