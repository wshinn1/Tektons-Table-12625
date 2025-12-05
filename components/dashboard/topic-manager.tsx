'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { createTopic, updateTopic, deleteTopic } from '@/app/actions/topics'

interface Topic {
  id: string
  name: string
  slug: string
  post_count: number
}

export function TopicManager({ 
  tenantId, 
  topics 
}: { 
  tenantId: string
  topics: Topic[] 
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, formData)
      } else {
        await createTopic(tenantId, formData)
      }
      setOpen(false)
      setEditingTopic(null)
      router.refresh()
    } catch (error) {
      console.error('Error saving topic:', error)
      alert('Failed to save topic')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (topicId: string) => {
    if (!confirm('Delete this topic? It will be removed from all posts.')) return
    
    setLoading(true)
    try {
      await deleteTopic(topicId)
      router.refresh()
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Failed to delete topic')
    } finally {
      setLoading(false)
    }
  }

  // Calculate font size based on post count for tag cloud effect
  const getTagSize = (postCount: number) => {
    const maxCount = Math.max(...topics.map(t => t.post_count), 1)
    const minSize = 0.875 // 14px
    const maxSize = 1.5 // 24px
    const ratio = postCount / maxCount
    return minSize + (ratio * (maxSize - minSize))
  }

  return (
    <div className="space-y-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingTopic(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? 'Edit Topic' : 'Create Topic'}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Topic Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingTopic?.name}
                placeholder="Kenya Mission"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Topic'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tag Cloud */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Topic Cloud
          </h3>
          <div className="flex flex-wrap gap-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                style={{ fontSize: `${getTagSize(topic.post_count)}rem` }}
              >
                <span className="font-medium">{topic.name}</span>
                <Badge variant="outline" className="ml-1">
                  {topic.post_count}
                </Badge>
              </button>
            ))}
            {topics.length === 0 && (
              <p className="text-muted-foreground">
                No topics yet. Topics are created when you add them to posts.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Topic List */}
      <div className="grid gap-3">
        <h3 className="text-lg font-semibold">All Topics</h3>
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({topic.post_count} {topic.post_count === 1 ? 'post' : 'posts'})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingTopic(topic)
                      setOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(topic.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {topics.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No topics yet. Topics are automatically created when you add them to posts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
