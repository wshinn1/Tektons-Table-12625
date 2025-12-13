"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { X, Upload, Plus, Loader2, Crown } from "lucide-react"
import { createBlogPost, uploadPlatformBlogImage, createPlatformCategory, createPlatformTag } from "@/app/actions/blog"
import { toast } from "sonner"
import { PublishModal } from "@/components/admin/blog/publish-modal"

const TiptapEditor = dynamic(() => import("@/components/admin/blog/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/30">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

interface AdminPostEditorProps {
  categories: Array<{ id: string; name: string; slug: string }>
  resourceCategories?: Array<{
    id: string
    name: string
    slug: string
    is_premium: boolean
    icon?: string
    color?: string
  }>
  tags: Array<{ id: string; name: string; slug: string }>
  post?: any
}

export function AdminPostEditor({
  categories: initialCategories,
  resourceCategories = [],
  tags: initialTags,
  post,
}: AdminPostEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(post?.title || "")
  const [subtitle, setSubtitle] = useState(post?.subtitle || "")
  const [readTime, setReadTime] = useState(post?.read_time?.toString() || "5")
  const [content, setContent] = useState(post?.content || "")
  const [selectedCategory, setSelectedCategory] = useState(post?.category_id || "none")
  const [selectedResourceCategory, setSelectedResourceCategory] = useState(post?.resource_category_id || "none")
  const [isPremium, setIsPremium] = useState(post?.is_premium || false)
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags?.map((t: any) => t.tag_id) || [])
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url || "")
  const [allowComments, setAllowComments] = useState(post?.allow_comments ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [tags, setTags] = useState(initialTags)
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [showNewTagDialog, setShowNewTagDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  const handleResourceCategoryChange = (value: string) => {
    setSelectedResourceCategory(value)
    if (value !== "none") {
      const category = resourceCategories.find((c) => c.id === value)
      if (category?.is_premium) {
        setIsPremium(true)
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadPlatformBlogImage(formData)
      setFeaturedImageUrl(result.url)
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsCreatingCategory(true)
    try {
      const newCategory = await createPlatformCategory(newCategoryName.trim())
      setCategories([...categories, newCategory])
      setSelectedCategory(newCategory.id)
      setNewCategoryName("")
      setShowNewCategoryDialog(false)
      toast.success("Category created successfully")
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("Failed to create category")
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Please enter a tag name")
      return
    }

    setIsCreatingTag(true)
    try {
      const newTag = await createPlatformTag(newTagName.trim())
      setTags([...tags, newTag])
      setSelectedTags([...selectedTags, newTag.id])
      setNewTagName("")
      setShowNewTagDialog(false)
      toast.success("Tag created successfully")
    } catch (error) {
      console.error("Failed to create tag:", error)
      toast.error("Failed to create tag")
    } finally {
      setIsCreatingTag(false)
    }
  }

  const handleAddTag = (tagId: string) => {
    if (tagId === "create-new") {
      setShowNewTagDialog(true)
      return
    }
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId))
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsSaving(true)

    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const postData = await createBlogPost({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        readTime: Number.parseInt(readTime) || 5,
        slug: slug || `draft-${Date.now()}`,
        content: content || "[]",
        status: "draft",
        allowComments,
        featuredImageUrl: featuredImageUrl || undefined,
        categoryIds: selectedCategory !== "none" ? [selectedCategory] : [],
        resourceCategoryId: selectedResourceCategory !== "none" ? selectedResourceCategory : undefined,
        isPremium,
        tagIds: selectedTags,
      })

      toast.success("Draft saved!")
      router.push(`/admin/blog/${postData.id}/edit`)
    } catch (error) {
      console.error("Failed to save draft:", error)
      toast.error("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishClick = () => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }
    setShowPublishModal(true)
  }

  const handlePublish = async (metadata: { slug: string; metaDescription: string }) => {
    setIsSaving(true)

    try {
      const postData = await createBlogPost({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        readTime: Number.parseInt(readTime) || 5,
        slug: metadata.slug,
        content: content || "[]",
        status: "published",
        metaDescription: metadata.metaDescription || undefined,
        allowComments,
        featuredImageUrl: featuredImageUrl || undefined,
        categoryIds: selectedCategory !== "none" ? [selectedCategory] : [],
        resourceCategoryId: selectedResourceCategory !== "none" ? selectedResourceCategory : undefined,
        isPremium,
        tagIds: selectedTags,
      })

      toast.success("Blog post published!")
      setShowPublishModal(false)
      router.push(`/admin/blog/${postData.id}/edit`)
    } catch (error) {
      console.error("Failed to publish blog post:", error)
      toast.error("Failed to publish blog post")
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentImageUpload = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return null
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB")
      return null
    }

    toast.loading("Uploading image...", { id: "content-image-upload" })
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadPlatformBlogImage(formData)
      toast.success("Image uploaded", { id: "content-image-upload" })
      return result.url
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error("Failed to upload image", { id: "content-image-upload" })
      return null
    }
  }

  return (
    <>
      <form className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="text-lg"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label htmlFor="subtitle">Subtitle (optional)</Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Brief summary of the post..."
                rows={2}
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt (optional)</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief excerpt of the post..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="featured-image">Featured Image (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="featured-image"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg or upload below"
                  className="flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="ml-2 hidden sm:inline">Upload</span>
                </Button>
              </div>
              {featuredImageUrl && (
                <div className="mt-2 relative aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-muted">
                  <img
                    src={featuredImageUrl || "/placeholder.svg"}
                    alt="Featured preview"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setFeaturedImageUrl("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-3">
              <Label htmlFor="read-time" className="whitespace-nowrap">
                Read time:
              </Label>
              <Input
                id="read-time"
                type="number"
                min="1"
                max="60"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </CardContent>
        </Card>

        {resourceCategories.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Premium Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resource-category">Resource Category</Label>
                <Select value={selectedResourceCategory} onValueChange={handleResourceCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resource category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No resource category</SelectItem>
                    {resourceCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {cat.name}
                          {cat.is_premium && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                              Premium
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assign this post to a resource category to show it on the /resources page
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 bg-white">
                <div className="space-y-0.5">
                  <Label htmlFor="is-premium" className="text-base flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-600" />
                    Premium Content
                  </Label>
                  <p className="text-sm text-muted-foreground">Require a subscription to view this post</p>
                </div>
                <Switch id="is-premium" checked={isPremium} onCheckedChange={setIsPremium} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Categories & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Blog Category (optional)</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    if (value === "create-new") {
                      setShowNewCategoryDialog(true)
                    } else {
                      setSelectedCategory(value)
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create-new" className="text-primary">
                      <span className="flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Create new category
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tags (optional)</Label>
              <Select onValueChange={handleAddTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Add tags..." />
                </SelectTrigger>
                <SelectContent>
                  {tags
                    .filter((tag) => !selectedTags.includes(tag.id))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="create-new" className="text-primary">
                    <span className="flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Create new tag
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {selectedTags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId)
                    return tag ? (
                      <Badge key={tagId} variant="secondary" className="pl-2 pr-1">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tagId)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <TiptapEditor
              initialContent={content}
              onChange={setContent}
              placeholder="Write your blog post content here..."
              onImageUpload={handleContentImageUpload}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Use the formatting toolbar to add headings, lists, images, quotes, and more.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-comments" className="text-base">
                  Allow Comments
                </Label>
                <p className="text-sm text-muted-foreground">Let readers comment on this post</p>
              </div>
              <Switch id="allow-comments" checked={allowComments} onCheckedChange={setAllowComments} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={isSaving} onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={handlePublishClick}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          </div>
        </div>
      </form>

      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        onPublish={handlePublish}
        title={title}
        excerpt={excerpt || subtitle}
        isPublishing={isSaving}
      />

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent aria-describedby="create-category-description">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription id="create-category-description">
              Create a new category to organize your blog posts.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-category">Category Name</Label>
            <Input
              id="new-category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name..."
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
              {isCreatingCategory ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-tag">Tag Name</Label>
            <Input
              id="new-tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name..."
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={isCreatingTag}>
              {isCreatingTag ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
