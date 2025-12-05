'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { createPost } from '@/app/actions/posts'

interface PostEditorProps {
  tenantId: string
  categories: Array<{ id: string; name: string; slug: string }>
  topics: Array<{ id: string; name: string; slug: string }>
  post?: any
}

export function PostEditor({ tenantId, categories, topics, post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  const [categoryId, setCategoryId] = useState(post?.category_id || '')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    post?.post_topics?.map((pt: any) => pt.topic_id) || []
  )
  const [status, setStatus] = useState(post?.status || 'draft')
  const [loading, setLoading] = useState(false)

  const handleAddTopic = (topicId: string) => {
    if (!selectedTopics.includes(topicId)) {
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  const handleRemoveTopic = (topicId: string) => {
    setSelectedTopics(selectedTopics.filter(id => id !== topicId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createPost({
        tenantId,
        title,
        excerpt,
        content,
        categoryId: categoryId || null,
        topicIds: selectedTopics,
        status
      })

      router.push('/dashboard/posts')
      router.refresh()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={2}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topics */}
          <div>
            <Label>Topics (optional)</Label>
            <Select onValueChange={handleAddTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Add topics..." />
              </SelectTrigger>
              <SelectContent>
                {topics
                  .filter(topic => !selectedTopics.includes(topic.id))
                  .map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedTopics.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedTopics.map((topicId) => {
                  const topic = topics.find(t => t.id === topicId)
                  return topic ? (
                    <Badge key={topicId} variant="secondary" className="pl-2 pr-1">
                      {topic.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topicId)}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={12}
              required
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={() => setStatus('draft')}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={() => setStatus('published')}
          >
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </form>
  )
}
