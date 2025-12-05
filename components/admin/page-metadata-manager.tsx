"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updatePageMetadata, uploadPageImage } from "@/app/actions/page-metadata"
import { Globe, Upload, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PageMetadata {
  id: string
  page_key: string
  page_name: string
  page_path: string
  title: string | null
  description: string | null
  keywords: string[] | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  og_type: string | null
  twitter_card: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image_url: string | null
  use_global_defaults: boolean
  is_active: boolean
}

export function PageMetadataManager({ pages }: { pages: PageMetadata[] }) {
  const [selectedPage, setSelectedPage] = useState<PageMetadata | null>(pages[0] || null)
  const [formData, setFormData] = useState(selectedPage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ogImageUploading, setOgImageUploading] = useState(false)
  const [twitterImageUploading, setTwitterImageUploading] = useState(false)

  const handlePageSelect = (page: PageMetadata) => {
    setSelectedPage(page)
    setFormData(page)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsSubmitting(true)
    try {
      await updatePageMetadata(formData.page_key, formData)
      toast.success("Page metadata updated successfully")
    } catch (error) {
      console.error("Failed to update metadata:", error)
      toast.error("Failed to update page metadata")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (file: File, type: "og" | "twitter") => {
    if (!formData) return

    const setUploading = type === "og" ? setOgImageUploading : setTwitterImageUploading
    setUploading(true)

    try {
      const url = await uploadPageImage(file, formData.page_key, type)

      if (type === "og") {
        handleInputChange("og_image_url", url)
      } else {
        handleInputChange("twitter_image_url", url)
      }

      toast.success(`${type === "og" ? "OG" : "Twitter"} image uploaded successfully`)
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  if (!formData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pages found. Please run the database migration.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Page List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pages</CardTitle>
          <CardDescription>Select a page to edit</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPage?.id === page.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{page.page_name}</span>
                  {page.use_global_defaults && <span className="text-xs bg-muted px-2 py-0.5 rounded">Global</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{page.page_path}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Editor */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{formData.page_name}</CardTitle>
                <CardDescription>
                  Edit social sharing metadata for {formData.page_path}
                  <a
                    href={`https://tektonstable.com${formData.page_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    View Page <ExternalLink className="w-3 h-3" />
                  </a>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="use-global" className="text-sm">
                  Use Global Defaults
                </Label>
                <Switch
                  id="use-global"
                  checked={formData.use_global_defaults}
                  onCheckedChange={(checked) => handleInputChange("use_global_defaults", checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!formData.use_global_defaults && (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic SEO</TabsTrigger>
                  <TabsTrigger value="opengraph">Open Graph</TabsTrigger>
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                </TabsList>

                {/* Basic SEO Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g., Pricing | Tektons Table"
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown in browser tabs and search results (50-60 characters ideal)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Meta Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Brief description of this page..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Shown in search results (150-160 characters ideal)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "keywords",
                          e.target.value.split(",").map((k) => k.trim()),
                        )
                      }
                      placeholder="missionary fundraising, donations, nonprofit"
                    />
                    <p className="text-xs text-muted-foreground">Help search engines understand your content</p>
                  </div>
                </TabsContent>

                {/* Open Graph Tab */}
                <TabsContent value="opengraph" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="og-title">OG Title</Label>
                    <Input
                      id="og-title"
                      value={formData.og_title || ""}
                      onChange={(e) => handleInputChange("og_title", e.target.value)}
                      placeholder="Leave blank to use page title"
                    />
                    <p className="text-xs text-muted-foreground">Title when shared on Facebook, LinkedIn, etc.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-description">OG Description</Label>
                    <Textarea
                      id="og-description"
                      value={formData.og_description || ""}
                      onChange={(e) => handleInputChange("og_description", e.target.value)}
                      placeholder="Leave blank to use meta description"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">Description shown in social previews</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-image">OG Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="og-image"
                        value={formData.og_image_url || ""}
                        onChange={(e) => handleInputChange("og_image_url", e.target.value)}
                        placeholder="https://..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={ogImageUploading}
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleImageUpload(file, "og")
                          }
                          input.click()
                        }}
                      >
                        {ogImageUploading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                    {formData.og_image_url && (
                      <div className="mt-2 rounded-lg border overflow-hidden">
                        <img
                          src={formData.og_image_url || "/placeholder.svg"}
                          alt="OG Preview"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: 1200x630px (PNG or JPG)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-type">OG Type</Label>
                    <Input
                      id="og-type"
                      value={formData.og_type || "website"}
                      onChange={(e) => handleInputChange("og_type", e.target.value)}
                      placeholder="website"
                    />
                    <p className="text-xs text-muted-foreground">Usually "website" or "article"</p>
                  </div>
                </TabsContent>

                {/* Twitter Tab */}
                <TabsContent value="twitter" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter-card">Twitter Card Type</Label>
                    <select
                      id="twitter-card"
                      value={formData.twitter_card || "summary_large_image"}
                      onChange={(e) => handleInputChange("twitter_card", e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Large image recommended for better engagement</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-title">Twitter Title</Label>
                    <Input
                      id="twitter-title"
                      value={formData.twitter_title || ""}
                      onChange={(e) => handleInputChange("twitter_title", e.target.value)}
                      placeholder="Leave blank to use OG title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-description">Twitter Description</Label>
                    <Textarea
                      id="twitter-description"
                      value={formData.twitter_description || ""}
                      onChange={(e) => handleInputChange("twitter_description", e.target.value)}
                      placeholder="Leave blank to use OG description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-image">Twitter Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="twitter-image"
                        value={formData.twitter_image_url || ""}
                        onChange={(e) => handleInputChange("twitter_image_url", e.target.value)}
                        placeholder="https://... (leave blank to use OG image)"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={twitterImageUploading}
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e: any) => {
                            const file = e.target.files[0]
                            if (file) handleImageUpload(file, "twitter")
                          }
                          input.click()
                        }}
                      >
                        {twitterImageUploading ? (
                          "Uploading..."
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                    {formData.twitter_image_url && (
                      <div className="mt-2 rounded-lg border overflow-hidden">
                        <img
                          src={formData.twitter_image_url || "/placeholder.svg"}
                          alt="Twitter Preview"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1200x675px for large cards, 800x800px for summary
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {formData.use_global_defaults && (
              <div className="p-8 text-center bg-muted/50 rounded-lg border border-dashed">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  This page is using global default settings.
                  <br />
                  Toggle "Use Global Defaults" off to customize this page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <a
              href={`https://www.opengraph.xyz/url/https%3A%2F%2Ftektonstable.com${formData.page_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Test OG Preview
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href={`https://cards-dev.twitter.com/validator`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Test Twitter Card
            </a>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
