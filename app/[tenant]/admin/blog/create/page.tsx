"use client"

// Last updated: 2026-03-15 - Fixed loading state and tenant lookup issues
import type React from "react"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { createBlogPost, uploadBlogImage } from "@/app/actions/blog"
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
import { Upload, X, Plus, Loader2 } from "lucide-react"
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
  }>
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let { width, height } = img

      // Scale down if larger than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file) // Fallback to original
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
    img.onerror = () => resolve(file) // Fallback to original on error
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

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  return { success: false, error: lastError?.message || "Upload failed after retries" }
}

export default function TenantCreateBlogPostPage({ params }: Props) {
  const { tenant } = use(params)
  const router = useRouter()
  const [tenantId, setTenantId] = useState<string>("")
  const [isLoadingTenant, setIsLoadingTenant] = useState(true)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [readTime, setReadTime] = useState("5")
  const [content, setContent] = useState("")
  const [allowComments, setAllowComments] = useState(true)
  const [followersOnly, setFollowersOnly] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [featuredImage, setFeaturedImage] = useState("")
  const [featuredImageCaption, setFeaturedImageCaption] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showFeaturedImage, setShowFeaturedImage] = useState(true)
  const [navbarVisible, setNavbarVisible] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none")
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 10
    
    async function loadTenant() {
      if (!tenant) {
        setIsLoadingTenant(false)
        return
      }

      // Method 1: Check DOM for tenant-data element (set by layout)
      const tenantDataEl = document.getElementById("tenant-data")
      const domTenantId = tenantDataEl?.getAttribute("data-tenant-id")
      if (domTenantId) {
        if (isMounted) {
          setTenantId(domTenantId)
          setIsLoadingTenant(false)
        }
        return
      }
      
      // Method 2: Check localStorage cache (both layout cache and admin cache)
      try {
        // Check layout's cache first (more reliable)
        const layoutCache = localStorage.getItem(`tenant-owner-${tenant}`)
        if (layoutCache) {
          const parsed = JSON.parse(layoutCache)
          if (parsed.tenantId && isMounted) {
            setTenantId(parsed.tenantId)
            setIsLoadingTenant(false)
            return
          }
        }
        
        // Also check admin cache
        const adminCache = localStorage.getItem(`tenant_admin_cache_${tenant}`)
        if (adminCache) {
          const parsed = JSON.parse(adminCache)
          if (parsed.tenantId && isMounted) {
            setTenantId(parsed.tenantId)
            setIsLoadingTenant(false)
            return
          }
        }
      } catch (e) {
        // Ignore cache errors
      }

      // Method 3: Wait for layout to populate DOM element
      // The layout also fetches tenant data, so we can wait for it
      if (retryCount < maxRetries) {
        retryCount++
        setTimeout(() => {
          if (isMounted) {
            loadTenant()
          }
        }, 300)
        return
      }

      // Method 4: Fallback - fetch from database ourselves
      try {
        const supabase = createBrowserClient()

        const { data: tenantData, error } = await supabase
          .from("tenants")
          .select("id")
          .eq("subdomain", tenant)
          .maybeSingle()

        if (error || !tenantData) {
          if (isMounted) {
            toast.error("Failed to load tenant information")
            setIsLoadingTenant(false)
          }
          return
        }

        // Cache for future use
        try {
          const existingCache = localStorage.getItem(`tenant_admin_cache_${tenant}`)
          const parsed = existingCache ? JSON.parse(existingCache) : {}
          parsed.tenantId = tenantData.id
          localStorage.setItem(`tenant_admin_cache_${tenant}`, JSON.stringify(parsed))
        } catch (e) {
          // Ignore cache errors
        }

        if (isMounted) {
          setTenantId(tenantData.id)
          setIsLoadingTenant(false)
        }
      } catch (error) {
        console.error("Failed to load tenant:", error)
        if (isMounted) {
          toast.error("Failed to load tenant information")
          setIsLoadingTenant(false)
        }
      }
    }

    loadTenant()
    
    return () => {
      isMounted = false
    }
  }, [tenant])

  useEffect(() => {
    async function loadCategories() {
      if (!tenantId) return
      try {
        const cats = await getCategories(tenantId)
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [tenantId])

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    setSlug(generateSlug(e.target.value))
  }

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!tenantId) {
        toast.error("Please wait for page to load")
        return null
      }

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
          toast.dismiss("image-upload")

          toast.loading("Trying server conversion...", { id: "image-upload" })

          try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("tenantId", tenantId)

            const result = await uploadWithRetry(formData)

            if (result.success && result.url) {
              toast.success("Image uploaded!", { id: "image-upload" })
              setIsUploadingImage(false)
              return result.url
            } else {
              throw new Error(result.error || "Server conversion failed")
            }
          } catch (serverError) {
            toast.error(
              "Could not process this image. Please open the photo in your Photos app, take a screenshot, and upload the screenshot instead.",
              { id: "image-upload", duration: 8000 },
            )
            return null
          }
        }
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      const isValidType =
        validTypes.includes(processedFile.type.toLowerCase()) || processedFile.type.startsWith("image/")

      if (!isValidType) {
        toast.error("Unsupported image format. Please use JPEG, PNG, GIF, or WebP.")
        return null
      }

      const maxSize = 10 * 1024 * 1024
      if (processedFile.size > maxSize) {
        toast.error("Image must be less than 10MB. Try a smaller image or compress it.")
        return null
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
        formData.append("tenantId", tenantId)

        const result = await uploadWithRetry(formData, isMobile ? 3 : 1)

        if (result.success && result.url) {
          toast.success("Image uploaded!", { id: "image-upload" })
          return result.url
        } else {
          toast.error(result.error || "Failed to upload image", { id: "image-upload" })
          return null
        }
      } catch (error) {
        toast.error("Failed to upload image. Check your connection and try again.", { id: "image-upload" })
        return null
      } finally {
        setIsUploadingImage(false)
      }
    },
    [tenantId],
  )

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await handleImageUpload(file)
    if (url) {
      setFeaturedImage(url)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !tenantId) return

    setIsCreatingCategory(true)
    try {
      const result = await createCategory({
        name: newCategoryName.trim(),
        tenantId,
      })

      if (result.success && result.category) {
        setCategories([...categories, result.category])
        setSelectedCategoryId(result.category.id)
        setShowNewCategoryDialog(false)
        setNewCategoryName("")
        toast.success("Category created!")
      } else {
        toast.error(result.error || "Failed to create category")
      }
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("Failed to create category")
    } finally {
      setIsCreatingCategory(false)
    }
  }

  async function handleSaveDraft() {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!tenantId) {
      toast.error("Please wait for page to load")
      return
    }

    setIsSaving(true)
    try {
      await createBlogPost({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug || generateSlug(title),
        readTime: Number.parseInt(readTime) || 5,
        content,
        status: "draft",
        metaDescription: excerpt.trim() || undefined,
        tenantId,
        allowComments,
        followersOnly,
        authorName: authorName.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageCaption: featuredImageCaption.trim() || undefined,
        showFeaturedImage,
        categoryIds: selectedCategoryId !== "none" ? [selectedCategoryId] : [],
        navbarVisible,
      })

      toast.success("Draft saved!")
      router.push(`/${tenant}/admin/blog`)
    } catch (error) {
      console.error("Failed to save draft:", error)
      toast.error("Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!tenantId) {
      toast.error("Please wait for page to load")
      return
    }

    setIsSaving(true)
    try {
      await createBlogPost({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug || generateSlug(title),
        readTime: Number.parseInt(readTime) || 5,
        content,
        status: "published",
        metaDescription: excerpt.trim() || undefined,
        tenantId,
        allowComments,
        followersOnly,
        authorName: authorName.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        featuredImage: featuredImage || undefined,
        featuredImageCaption: featuredImageCaption.trim() || undefined,
        showFeaturedImage,
        categoryIds: selectedCategoryId !== "none" ? [selectedCategoryId] : [],
        navbarVisible,
      })

      toast.success("Blog post published!")
      router.push(`/${tenant}/admin/blog`)
    } catch (error) {
      console.error("Failed to publish blog post:", error)
      toast.error("Failed to publish blog post")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingTenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-muted-foreground">Create Blog Post</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              Publish
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
                <span className="text-muted-foreground text-sm">/blog/</span>
                <Input id="slug" value={slug} onChange={handleSlugChange} placeholder="url-slug" className="flex-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-sm font-medium mb-2 block">
                Subtitle
              </Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional subtitle or tagline"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName" className="text-sm font-medium mb-2 block">
                  Author Name
                </Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Author name (optional)"
                />
              </div>
              <div>
                <Label htmlFor="readTime" className="text-sm font-medium mb-2 block">
                  Read Time (min)
                </Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt" className="text-sm font-medium mb-2 block">
                Excerpt / Meta Description
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description for SEO and post previews"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <div className="flex gap-2">
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCategoryDialog(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage || "/placeholder.svg"}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
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
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploadingImage ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload featured image</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  disabled={isUploadingImage}
                />
              </label>
            )}

            {featuredImage && (
              <div>
                <Label htmlFor="featuredImageCaption" className="text-sm font-medium mb-2 block">
                  Image Caption
                </Label>
                <Input
                  id="featuredImageCaption"
                  value={featuredImageCaption}
                  onChange={(e) => setFeaturedImageCaption(e.target.value)}
                  placeholder="Optional caption for the featured image"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="showFeaturedImage" checked={showFeaturedImage} onCheckedChange={setShowFeaturedImage} />
              <Label htmlFor="showFeaturedImage">Show featured image in post</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <TiptapEditor content={content} onChange={setContent} onImageUpload={handleImageUpload} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="allowComments" checked={allowComments} onCheckedChange={setAllowComments} />
              <Label htmlFor="allowComments">Allow comments</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="followersOnly" checked={followersOnly} onCheckedChange={setFollowersOnly} />
              <Label htmlFor="followersOnly">Followers only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="navbarVisible" checked={navbarVisible} onCheckedChange={setNavbarVisible} />
              <Label htmlFor="navbarVisible">Show navigation bar on post page</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push(`/${tenant}/admin/blog`)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newCategoryName" className="text-sm font-medium mb-2 block">
              Category Name
            </Label>
            <Input
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={isCreatingCategory || !newCategoryName.trim()}>
              {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
