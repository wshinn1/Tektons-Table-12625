"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { updateBlogPost, getBlogPost, uploadBlogImage } from "@/app/actions/blog"
import { getCategories, createCategory } from "@/app/actions/categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Upload, X, Plus } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

const TiptapEditor = dynamic(() => import("@/components/admin/blog/tiptap-editor").then((mod) => mod.TiptapEditor), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/30">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  params: Promise<{
    tenant: string
    id: string
  }>
}

async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        "image/jpeg",
        quality,
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

async function uploadWithRetry(
  formData: FormData,
  maxRetries = 3,
): Promise<{ success: boolean; url?: string; error?: string }> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadBlogImage(formData)
      if (result.success) {
        return result
      }
      lastError = new Error(result.error || "Upload failed")
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  return { success: false, error: lastError?.message || "Upload failed after retries" }
}

const handleContentImageUpload = async (file: File): Promise<string | null> => {
  let processedFile = file
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  const hasHeicExtension = fileName.endsWith(".heic") || fileName.endsWith(".heif")
  const hasHeicMimeType = fileType === "image/heic" || fileType === "image/heif"
  const hasEmptyOrGenericType = fileType === "" || fileType === "application/octet-stream"
  const isHeic = hasHeicMimeType || (hasHeicExtension && hasEmptyOrGenericType) || hasHeicExtension

  if (isHeic) {
    toast.loading("Converting image format...", { id: "content-image-upload" })
    try {
      const heic2any = (await import("heic2any")).default
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.85,
      })
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
      processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
        type: "image/jpeg",
      })
      toast.dismiss("content-image-upload")
    } catch {
      toast.error("Could not convert image format", { id: "content-image-upload" })
      return null
    }
  }

  if (!processedFile.type.startsWith("image/")) {
    toast.error("Please select an image file")
    return null
  }

  // Compress large images on mobile
  if (isMobile && processedFile.size > 2 * 1024 * 1024) {
    try {
      processedFile = await compressImage(processedFile, 1920, 0.85)
    } catch {
      // Continue with original file
    }
  }

  toast.loading("Uploading image...", { id: "content-image-upload" })
  try {
    const formData = new FormData()
    formData.append("file", processedFile)

    const result = await uploadWithRetry(formData, isMobile ? 3 : 1)

    if (result.success && result.url) {
      toast.success("Image uploaded", { id: "content-image-upload" })
      return result.url
    } else {
      toast.error(result.error || "Failed to upload image", { id: "content-image-upload" })
      return null
    }
  } catch {
    toast.error("Failed to upload image", { id: "content-image-upload" })
    return null
  }
}

export default function EditBlogPost({ params }: Props) {
  const router = useRouter()
  const { tenant, id } = use(params)

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [slug, setSlug] = useState("")
  const [readTime, setReadTime] = useState("5")
  const [content, setContent] = useState("")
  const [allowComments, setAllowComments] = useState(true)
  const [followersOnly, setFollowersOnly] = useState(false)
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [isSaving, setIsSaving] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const [featuredImageCaption, setFeaturedImageCaption] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showFeaturedImage, setShowFeaturedImage] = useState(true)
  const [tenantId, setTenantId] = useState<string>("")
  const [navbarVisible, setNavbarVisible] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none")
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  useEffect(() => {
    async function loadTenant() {
      if (!isValidUUID) return
      try {
        const supabase = createBrowserClient()
        const { data: tenantData, error } = await supabase.from("tenants").select("id").eq("subdomain", tenant).single()

        if (error) {
          console.error("Failed to load tenant:", error)
          return
        }

        if (tenantData) {
          setTenantId(tenantData.id)
        }
      } catch (error) {
        console.error("Failed to load tenant:", error)
      }
    }

    if (tenant) {
      loadTenant()
    }
  }, [tenant, isValidUUID])

  useEffect(() => {
    async function loadData() {
      if (!isValidUUID) {
        setLoading(false)
        return
      }
      try {
        const post = await getBlogPost(id)
        setTitle(post.title)
        setSubtitle(post.subtitle || "")
        setSlug(post.slug)
        setReadTime(String(post.read_time_minutes || 5))
        setContent(post.content || "[]")
        setAllowComments(post.allow_comments ?? true)
        setFollowersOnly(post.followers_only ?? false)
        setStatus(post.status)
        setAuthorName(post.author_name || "")
        setExcerpt(post.excerpt || post.meta_description || "")
        setFeaturedImage(post.featured_image_url || "")
        setFeaturedImageCaption(post.featured_image_caption || "")
        setShowFeaturedImage(post.show_featured_image ?? true)
        setNavbarVisible(post.navbar_visible ?? true)
      } catch (error) {
        console.error("Failed to load post:", error)
        toast.error("Failed to load post")
        router.push("/admin/blog")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, router, isValidUUID])

  useEffect(() => {
    async function loadCategories() {
      if (!tenantId || !isValidUUID) return
      try {
        const cats = await getCategories(tenantId)
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [tenantId, isValidUUID])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    if (!tenantId) {
      toast.error("Tenant information not loaded")
      return
    }

    setIsCreatingCategory(true)
    try {
      const newCategory = await createCategory(tenantId, newCategoryName.trim())
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    let processedFile = file
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()
    const hasHeicExtension = fileName.endsWith(".heic") || fileName.endsWith(".heif")
    const hasHeicMimeType = fileType === "image/heic" || fileType === "image/heif"
    const hasEmptyOrGenericType = fileType === "" || fileType === "application/octet-stream"
    const isHeic = hasHeicMimeType || (hasHeicExtension && hasEmptyOrGenericType) || hasHeicExtension

    if (isHeic) {
      toast.loading("Converting image format...", { id: "image-upload" })
      try {
        const heic2any = (await import("heic2any")).default
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.85,
        })
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
          type: "image/jpeg",
        })
        toast.dismiss("image-upload")
      } catch (conversionError) {
        toast.error("Could not convert image. Please try a different photo or convert to JPEG first.", {
          id: "image-upload",
        })
        return
      }
    }

    const isValidType = processedFile.type.startsWith("image/")

    if (!isValidType) {
      toast.error("Unsupported image format. Please use JPEG, PNG, GIF, WebP, or HEIC.")
      return
    }

    if (processedFile.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB")
      return
    }

    // Compress large images on mobile before upload
    if (isMobile && processedFile.size > 2 * 1024 * 1024) {
      toast.loading("Optimizing image for upload...", { id: "image-upload" })
      try {
        processedFile = await compressImage(processedFile, 1920, 0.85)
      } catch (compressError) {
        // Continue with original file if compression fails
      }
    }

    setIsUploadingImage(true)
    toast.loading("Uploading image...", { id: "image-upload" })
    try {
      const formData = new FormData()
      formData.append("file", processedFile)

      const result = await uploadWithRetry(formData, isMobile ? 3 : 1)

      if (result.success && result.url) {
        setFeaturedImage(result.url)
        toast.success("Image uploaded successfully", { id: "image-upload" })
      } else {
        toast.error(result.error || "Failed to upload image", { id: "image-upload" })
      }
    } catch (error) {
      toast.error("Failed to upload image. Check your connection and try again.", { id: "image-upload" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = async (newStatus?: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsSaving(true)
    try {
      console.log("[v0] Saving blog post:", {
        id,
        titleLength: title.length,
        contentLength: content?.length || 0,
        status: newStatus || status,
      })

      const result = await updateBlogPost(id, {
        title,
        subtitle: subtitle.trim() || undefined,
        slug,
        readTime: Number.parseInt(readTime) || 5,
        content: content || "[]",
        status: newStatus || status,
        metaDescription: excerpt.trim() || undefined,
        allowComments,
        followersOnly,
        excerpt: excerpt.trim() || undefined,
        authorName: authorName.trim() || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageCaption: featuredImageCaption.trim() || undefined,
        showFeaturedImage,
        categoryIds: selectedCategoryId !== "none" ? [selectedCategoryId] : [],
        navbarVisible,
      })

      console.log("[v0] Blog post saved successfully:", result)
      toast.success(newStatus === "published" ? "Post published!" : "Changes saved!")
      router.push("/admin/blog")
    } catch (error) {
      console.error("[v0] Failed to save blog post:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to save changes: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isValidUUID) {
    console.error("[v0] Invalid blog post ID format:", id)
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Invalid Blog Post ID</h2>
          <p className="text-red-700 mb-4">
            The blog post ID in the URL is invalid. Please navigate to the blog post from your blog list.
          </p>
          <Link
            href={`/${tenant}/admin/blog`}
            className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Return to Blog List
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/blog">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold text-muted-foreground">Edit Blog Post</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
              {status === "draft" ? "Save Draft" : "Unpublish"}
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your blog post title"
                className="text-lg font-semibold"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="text-sm font-medium mb-2 block">
                URL Slug
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/blog/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="url-slug"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">This is the URL path for your post.</p>
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-sm font-medium mb-2 block">
                Subtitle (optional)
              </Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A brief description that appears below the title"
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author-name" className="text-sm font-medium mb-2 block">
                  Author Name (optional)
                </Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <Label htmlFor="read-time" className="text-sm font-medium mb-2 block">
                  Read Time (minutes)
                </Label>
                <Input
                  id="read-time"
                  type="number"
                  min="1"
                  max="60"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
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
              <SelectTrigger>
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
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Excerpt / SEO Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief excerpt for social sharing, previews, and search engines (recommended 150-160 characters)"
              className="resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">{excerpt.length}/200 characters</p>
            <p className="text-xs text-muted-foreground mt-1">
              This text will appear when your blog post is shared on social media and in search engine results.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredImage ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <img
                    src={featuredImage || "/placeholder.svg"}
                    alt="Featured"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor="image-caption" className="text-sm text-muted-foreground mb-2 block">
                    Image Caption (optional)
                  </Label>
                  <Input
                    id="image-caption"
                    value={featuredImageCaption}
                    onChange={(e) => setFeaturedImageCaption(e.target.value)}
                    placeholder="Add a caption for the featured image"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-featured-image" className="text-base">
                      Display Featured Image
                    </Label>
                    <p className="text-sm text-muted-foreground">Show the featured image on the blog post page</p>
                  </div>
                  <Switch id="show-featured-image" checked={showFeaturedImage} onCheckedChange={setShowFeaturedImage} />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="featured-image" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {isUploadingImage ? "Uploading..." : "Click to upload featured image"}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </Label>
                <Input
                  id="featured-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TiptapEditor
              initialContent={content}
              onChange={setContent}
              placeholder="Start writing your blog post..."
              onImageUpload={handleContentImageUpload}
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="navbar-visible" className="text-base">
                  Show Navigation
                </Label>
                <p className="text-sm text-muted-foreground">Display the top navigation bar on this post</p>
              </div>
              <Switch id="navbar-visible" checked={navbarVisible} onCheckedChange={setNavbarVisible} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-comments" className="text-base">
                  Allow Comments
                </Label>
                <p className="text-sm text-muted-foreground">Let supporters and followers comment on this post</p>
              </div>
              <Switch id="allow-comments" checked={allowComments} onCheckedChange={setAllowComments} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="followers-only" className="text-base">
                  Followers Only
                </Label>
                <p className="text-sm text-muted-foreground">Restrict this post to approved followers only</p>
              </div>
              <Switch id="followers-only" checked={followersOnly} onCheckedChange={setFollowersOnly} />
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
