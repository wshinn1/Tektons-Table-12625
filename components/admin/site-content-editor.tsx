'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { updateSiteContent } from '@/app/actions/site-content'

interface SiteContent {
  id: string
  section: string
  content: any
  is_active: boolean
  updated_at: string
}

interface SiteContentEditorProps {
  initialContent: SiteContent[]
}

export default function SiteContentEditor({ initialContent }: SiteContentEditorProps) {
  const [content, setContent] = useState<SiteContent[]>(initialContent)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Section',
    savings_card: 'Savings Card',
    features_section: 'Features Section',
    pricing_section: 'Pricing Section',
    social_proof: 'Social Proof',
    final_cta: 'Final CTA',
    announcement_banner: 'Announcement Banner'
  }

  const handleEdit = (section: SiteContent) => {
    setEditing(section.id)
    setEditValue(JSON.stringify(section.content, null, 2))
  }

  const handleSave = async (sectionId: string) => {
    setLoading(sectionId)
    
    try {
      const parsedContent = JSON.parse(editValue)
      const result = await updateSiteContent(sectionId, parsedContent)
      
      if (result.success) {
        setContent(prev => prev.map(item => 
          item.id === sectionId 
            ? { ...item, content: parsedContent, updated_at: new Date().toISOString() }
            : item
        ))
        setEditing(null)
        toast({
          title: 'Content updated',
          description: 'Landing page content has been saved successfully.'
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update content',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Invalid JSON',
        description: 'Please check your JSON syntax and try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(null)
    }
  }

  const handleToggleActive = async (sectionId: string, currentStatus: boolean) => {
    setLoading(sectionId)
    
    const section = content.find(c => c.id === sectionId)
    if (!section) return
    
    const result = await updateSiteContent(sectionId, section.content, !currentStatus)
    
    if (result.success) {
      setContent(prev => prev.map(item => 
        item.id === sectionId 
          ? { ...item, is_active: !currentStatus }
          : item
      ))
      toast({
        title: currentStatus ? 'Section hidden' : 'Section activated',
        description: `This section is now ${!currentStatus ? 'visible' : 'hidden'} on the landing page.`
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to toggle section',
        variant: 'destructive'
      })
    }
    
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      {content.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{sectionLabels[section.section] || section.section}</CardTitle>
                <CardDescription>
                  Last updated: {new Date(section.updated_at).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={section.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleActive(section.id, section.is_active)}
                  disabled={loading === section.id}
                >
                  {loading === section.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : section.is_active ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hidden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editing === section.id ? (
              <div className="space-y-4">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Edit JSON content..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(section.id)}
                    disabled={loading === section.id}
                  >
                    {loading === section.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(null)}
                    disabled={loading === section.id}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(section.content, null, 2)}
                </pre>
                <Button onClick={() => handleEdit(section)}>
                  Edit Content
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
