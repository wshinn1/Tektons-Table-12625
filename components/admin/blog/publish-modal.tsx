"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PublishModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (metadata: { slug: string; metaDescription: string }) => void
  title: string
  excerpt?: string
  isPublishing: boolean
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-") // Replace multiple consecutive hyphens with single hyphen
    .replace(/(^-|-$)/g, "")
}

export function PublishModal({ open, onOpenChange, onPublish, title, excerpt, isPublishing }: PublishModalProps) {
  const [slug, setSlug] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [metaManuallyEdited, setMetaManuallyEdited] = useState(false)

  useEffect(() => {
    if (open && !slugManuallyEdited) {
      setSlug(generateSlug(title))
    }
  }, [open, title, slugManuallyEdited])

  useEffect(() => {
    if (open && !metaManuallyEdited && excerpt) {
      const truncatedExcerpt = excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt
      setMetaDescription(truncatedExcerpt)
    }
  }, [open, excerpt, metaManuallyEdited])

  useEffect(() => {
    if (!open) {
      setSlugManuallyEdited(false)
      setMetaManuallyEdited(false)
    }
  }, [open])

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    // Sanitize as user types - only allow lowercase letters, numbers, and single hyphens
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
    setSlug(sanitized)
  }

  const handleMetaChange = (value: string) => {
    setMetaManuallyEdited(true)
    setMetaDescription(value)
  }

  const handlePublish = () => {
    const finalSlug = generateSlug(slug)
    onPublish({ slug: finalSlug, metaDescription })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Publish Blog Post</DialogTitle>
          <DialogDescription>Add SEO information before publishing your post.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-friendly-slug"
              className="font-mono"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com"}/blog/{slug || "url-slug"}
            </p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => handleMetaChange(e.target.value)}
              placeholder="Brief description for search engines..."
              rows={3}
              maxLength={160}
            />
            <p className="mt-1 text-sm text-muted-foreground">{metaDescription.length}/160 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !slug.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
