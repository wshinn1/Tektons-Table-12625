'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateDemoSiteContent } from '@/app/actions/demo-site'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface DemoSiteEditorProps {
  section: string
  initialData?: any
}

export function DemoSiteEditor({ section, initialData }: DemoSiteEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(JSON.stringify(initialData?.content || {}, null, 2))
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Validate JSON
      const parsedContent = JSON.parse(content)

      const result = await updateDemoSiteContent(section, parsedContent, isActive)
      
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{section} Configuration</CardTitle>
        <CardDescription>
          Edit the JSON content for the {section} section
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="active">Section Active</Label>
          <Switch
            id="active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div>
          <Label>Content (JSON)</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-sm min-h-[400px]"
            placeholder='{"key": "value"}'
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
}
