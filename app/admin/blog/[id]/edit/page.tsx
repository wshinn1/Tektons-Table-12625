"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  updateBlogPost,
  getBlogPost,
  deleteBlogPost,
  createPlatformCategory,
  createPlatformTag,
  uploadPlatformBlogImage,
} from "@/app/actions/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { ArrowLeft, Trash2, Plus, Loader2, X, Crown, Upload } from "lucide-react"
import Link from "next/link"

const TiptapEditor = dynamic(() => import("@/components/admin/blog/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 bg-background min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

interface Category {
  id: string
  name: string
  slug: string
}

interface ResourceCategory {
  id: string
  name: string
  slug: string
  is_premium: boolean
}

interface Tag {
  id: string
  name: string
  slug: string
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <EditBlogPostClient id={id} />
}

function EditBlogPostClient({ id }: { id: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [slug, setSlug] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [featuredImageUrl, setFeaturedImageUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none")
  const [selectedResourceCategoryId, setSelectedResourceCategoryId] = useState<string>("none")
  const [isPremium, setIsPremium] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [showNewTagDialog, setShowNewTagDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newTagName, setNewTagName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)

  const handleResourceCategoryChange = (value: string) => {
    setSelectedResourceCategoryId(value)
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

  useEffect(() => {
    async function loadData() {
      try {
        const post = await getBlogPost(id)
        setTitle(post.title)
        setSubtitle(post.subtitle || "")
        setSlug(post.slug)
        setMetaDescription(post.meta_description || "")
        setContent(typeof post.content === "string" ? post.content : JSON.stringify(post.content))
        setStatus(post.status)
        setIsPremium(post.is_premium || false)
        setSelectedResourceCategoryId(post.resource_category_id || "none")
        setFeaturedImageUrl(post.featured_image_url || "")

        const [categoriesRes, resourceCategoriesRes, tagsRes] = await Promise.all([
          fetch("/api/admin/blog/categories"),
          fetch("/api/admin/resource-categories"),
          fetch("/api/admin/blog/tags"),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        if (resourceCategoriesRes.ok) {
          const resourceCategoriesData = await resourceCategoriesRes.json()
          setResourceCategories(resourceCategoriesData)
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error("Failed to load blog post:", error)
        toast.error("Failed to load blog post")
        router.push("/admin/blog")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsCreatingCategory(true)
    try {
      const newCategory = await createPlatformCategory(newCategoryName.trim())
      setCategories([...categories, newCategory])
      setSelectedCategoryId(newCategory.id)
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
      setSelectedTagIds([...selectedTagIds, newTag.id])
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
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
  }

  const handleSave = async (newStatus?: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!slug.trim()) {
      toast.error("Please enter a slug")
      return
    }

    setIsSaving(true)

    try {
      await updateBlogPost(id, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug.trim(),
        content,
        status: newStatus || status,
        metaDescription: metaDescription.trim() || undefined,
        categoryIds: selectedCategoryId !== "none" ? [selectedCategoryId] : [],
        tagIds: selectedTagIds,
        resourceCategoryId: selectedResourceCategoryId !== "none" ? selectedResourceCategoryId : undefined,
        isPremium,
        featuredImageUrl: featuredImageUrl || undefined,
      })

      toast.success(newStatus === "published" ? "Blog post published!" : "Changes saved!")

      if (newStatus && newStatus !== status) {
        setStatus(newStatus)
      }
    } catch (error) {
      console.error("Failed to save blog post:", error)
      toast.error("Failed to save blog post")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteBlogPost(id)
      toast.success("Blog post deleted")
      router.push("/admin/blog")
    } catch (error) {
      console.error("Failed to delete blog post:", error)
      toast.error("Failed to delete blog post")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status === "published" ? "Published" : "Draft"}
          </Badge>
          {isPremium && (
            <Badge className="bg-amber-100 text-amber-800">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the blog post and all its content.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {status === "draft" && (
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
              Save Draft
            </Button>
          )}

          {status === "draft" ? (
            <Button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          ) : (
            <Button onClick={() => handleSave("published")} disabled={isSaving}>
              Update
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="mb-8 space-y-6 rounded-lg border bg-muted/30 p-6">
        <div>
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-friendly-slug"
            className="font-mono"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            {process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com"}/blog/{slug || "url-slug"}
          </p>
        </div>

        <div>
          <Label htmlFor="featured-image">Featured Image</Label>
          <div className="flex gap-2">
            <Input
              id="featured-image"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg or upload below"
              className="flex-1"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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

        <div>
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Brief description for search engines..."
            rows={2}
            maxLength={160}
          />
          <p className="mt-1 text-sm text-muted-foreground">{metaDescription.length}/160 characters</p>
        </div>
      </div>

      {resourceCategories.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              Premium Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resource-category">Resource Category</Label>
              <Select value={selectedResourceCategoryId} onValueChange={handleResourceCategoryChange}>
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Categories & Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Blog Category (optional)</Label>
            <div className="flex gap-2">
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => {
                  if (value === "create-new") {
                    setShowNewCategoryDialog(true)
                  } else {
                    setSelectedCategoryId(value)
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
                  .filter((tag) => !selectedTagIds.includes(tag.id))
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

            {selectedTagIds.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedTagIds.map((tagId) => {
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

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mb-2 w-full border-none text-5xl font-bold placeholder:text-muted-foreground focus:outline-none"
      />

      <input
        type="text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        placeholder="Subtitle (optional)"
        className="mb-8 w-full border-none text-2xl text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />

      <Card>
        <CardHeader>
          <CardTitle>Content *</CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditor initialContent={content} onChange={setContent} placeholder="Start writing your blog post..." />
          <p className="text-xs text-muted-foreground mt-2">
            Use the formatting toolbar to add headings, lists, images, quotes, and more.
          </p>
        </CardContent>
      </Card>

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
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
    </div>
  )
}
