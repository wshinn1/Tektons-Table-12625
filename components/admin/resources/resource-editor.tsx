"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Eye, Lock, X, ImageIcon } from "lucide-react"
import { createResource, updateResource } from "@/app/actions/resources"
import { toast } from "sonner"
import { upload } from "@vercel/blob/client"

const TiptapEditor = dynamic(() => import("@/components/admin/blog/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/30">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

interface Category {
  id: string
  name: string
  slug: string
  is_premium: boolean
  icon: string | null
  color: string | null
}

interface Resource {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: any
  featured_image: string | null
  is_premium: boolean
  status: string
  meta_title: string | null
  meta_description: string | null
  categories?: { category_id: string; category: Category }[]
}

interface ResourceEditorProps {
  resource?: Resource
  categories: Category[]
}

export function ResourceEditor({ resource, categories }: ResourceEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const getInitialContent = () => {
    if (resource?.content) {
      return typeof resource.content === "string" ? resource.content : JSON.stringify(resource.content)
    }
    return JSON.stringify({ type: "doc", content: [] })
  }

  const [formData, setFormData] = useState({
    title: resource?.title || "",
    excerpt: resource?.excerpt || "",
    content: getInitialContent(), // Store as string
    featured_image: resource?.featured_image || "",
    is_premium: resource?.is_premium || false,
    status: resource?.status || "draft",
    category_ids: resource?.categories?.map((c) => c.category_id) || [],
    meta_title: resource?.meta_title || "",
    meta_description: resource?.meta_description || "",
  })

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      setFormData({ ...formData, featured_image: blob.url })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const isSelected = prev.category_ids.includes(categoryId)
      return {
        ...prev,
        category_ids: isSelected
          ? prev.category_ids.filter((id) => id !== categoryId)
          : [...prev.category_ids, categoryId],
      }
    })
  }

  const handleContentChange = (contentString: string) => {
    setFormData((prev) => ({ ...prev, content: contentString }))
  }

  const handleSubmit = async (publishStatus?: "draft" | "published") => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    setIsLoading(true)
    try {
      const status = publishStatus || formData.status

      let contentJson
      try {
        contentJson = JSON.parse(formData.content)
      } catch {
        contentJson = { type: "doc", content: [] }
      }

      const data = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: contentJson,
        featured_image: formData.featured_image,
        is_premium: formData.is_premium,
        status: status as "draft" | "published" | "archived",
        category_ids: formData.category_ids,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      }

      if (resource) {
        const result = await updateResource(resource.id, data)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(status === "published" ? "Resource published!" : "Resource saved!")
          router.push("/admin/resources")
        }
      } else {
        const result = await createResource(data)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(status === "published" ? "Resource published!" : "Resource saved!")
          router.push("/admin/resources")
        }
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const freeCategories = categories.filter((c) => !c.is_premium)
  const premiumCategories = categories.filter((c) => c.is_premium)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title & Excerpt */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter resource title"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description for search results and previews"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Content Editor */}
        <Card className="p-6">
          <Label className="mb-4 block">Content</Label>
          <div className="min-h-[500px]">
            <TiptapEditor
              initialContent={formData.content}
              onChange={handleContentChange}
              placeholder="Start writing your resource content..."
            />
          </div>
        </Card>

        {/* SEO Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">SEO Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="SEO title (defaults to title if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="SEO description (defaults to excerpt if empty)"
                rows={2}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Publish</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={formData.status === "published" ? "default" : "secondary"}>
                {formData.status === "published" ? "Published" : formData.status === "archived" ? "Archived" : "Draft"}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleSubmit("draft")}
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button className="flex-1" onClick={() => handleSubmit("published")} disabled={isLoading}>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
        </Card>

        {/* Premium Toggle */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                Premium Content
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Requires subscription to access</p>
            </div>
            <Switch
              checked={formData.is_premium}
              onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
            />
          </div>
        </Card>

        {/* Featured Image */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Featured Image</h3>
          {formData.featured_image ? (
            <div className="relative">
              <img
                src={formData.featured_image || "/placeholder.svg"}
                alt="Featured"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setFormData({ ...formData, featured_image: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="text-sm text-muted-foreground">Uploading...</div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">Click to upload</span>
                </>
              )}
            </label>
          )}
        </Card>

        {/* Categories */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Categories</h3>

          {freeCategories.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Free</p>
              <div className="space-y-2">
                {freeCategories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.category_ids.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {premiumCategories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase mb-2 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </p>
              <div className="space-y-2">
                {premiumCategories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.category_ids.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No categories yet.{" "}
              <a href="/admin/resources/categories" className="text-blue-600 hover:underline">
                Create one
              </a>
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
