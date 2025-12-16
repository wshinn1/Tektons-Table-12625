'use client'

import { Puck } from '@measured/puck'
import '@measured/puck/puck.css'
import { config } from '@/lib/puck-config'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PuckPageEditorProps {
  tenant: string
  pageId?: string
  initialData?: any
}

export function PuckPageEditor({ tenant, pageId, initialData }: PuckPageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handlePublish = async (data: any) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/pages${pageId ? `/${pageId}` : ''}`, {
        method: pageId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant,
          content: data,
        }),
      })

      if (response.ok) {
        router.push(`/${tenant}/admin/pages`)
      } else {
        console.error('Failed to save page')
      }
    } catch (error) {
      console.error('Error saving page:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen">
      <Puck
        config={config}
        data={initialData || { content: [], root: {} }}
        onPublish={handlePublish}
      />
    </div>
  )
}
