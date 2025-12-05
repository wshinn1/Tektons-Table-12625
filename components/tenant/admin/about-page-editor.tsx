"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface AdditionalSection {
  title: string
  content: string
  image?: string
}

interface AboutContent {
  mission_title: string
  mission_content: string
  mission_image?: string
  story_title: string
  story_content: string
  story_image?: string
  additional_sections: AdditionalSection[]
  button_text?: string
  button_url?: string
}

export function AboutPageEditor({
  tenantId,
  initialContent,
  tenantSlug,
}: {
  tenantId: string
  initialContent: any
  tenantSlug: string
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState<string | null>(null)

  const [content, setContent] = useState<AboutContent>({
    mission_title: initialContent?.mission_title || "Our Mission",
    mission_content: initialContent?.mission_content || "",
    mission_image: initialContent?.mission_image || "",
    story_title: initialContent?.story_title || "Our Story",
    story_content: initialContent?.story_content || "",
    story_image: initialContent?.story_image || "",
    additional_sections: initialContent?.additional_sections || [],
    button_text: initialContent?.button_text || "",
    button_url: initialContent?.button_url || "",
  })

  const handleImageUpload = async (file: File, field: string, sectionIndex?: number) => {
    setIsUploading(field)
    try {
      console.log("[v0] About page - Starting image upload for field:", field)
      console.log("[v0] File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        tenantId: tenantId,
        sectionIndex: sectionIndex,
      })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("tenantId", tenantId)

      console.log("[v0] FormData prepared, sending to /api/tenant/upload-media")
      console.log("[v0] Tenant ID:", tenantId)

      const response = await fetch("/api/tenant/upload-media", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.log("[v0] Upload failed with error:", error)
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      console.log("[v0] Upload successful! Response data:", data)
      console.log("[v0] Image URL:", data.url)

      if (sectionIndex !== undefined) {
        const newSections = [...content.additional_sections]
        newSections[sectionIndex].image = data.url
        setContent({ ...content, additional_sections: newSections })
        console.log("[v0] Updated additional section", sectionIndex, "with image")
      } else {
        setContent({ ...content, [field]: data.url })
        console.log("[v0] Updated", field, "with image")
      }

      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("[v0] About page - Image upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(null)
      console.log("[v0] Upload process complete for field:", field)
    }
  }

  const addSection = () => {
    setContent({
      ...content,
      additional_sections: [...content.additional_sections, { title: "", content: "", image: "" }],
    })
  }

  const removeSection = (index: number) => {
    const newSections = content.additional_sections.filter((_, i) => i !== index)
    setContent({ ...content, additional_sections: newSections })
  }

  const updateSection = (index: number, field: keyof AdditionalSection, value: string) => {
    const newSections = [...content.additional_sections]
    newSections[index][field] = value
    setContent({ ...content, additional_sections: newSections })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/tenant/about-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, content }),
      })

      if (response.ok) {
        toast.success("About page updated successfully")
        router.refresh()
      } else {
        toast.error("Failed to update about page")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mission Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mission-title">Section Title</Label>
            <Input
              id="mission-title"
              value={content.mission_title}
              onChange={(e) => setContent({ ...content, mission_title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="mission-content">Content</Label>
            <Textarea
              id="mission-content"
              value={content.mission_content}
              onChange={(e) => setContent({ ...content, mission_content: e.target.value })}
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="mission-image">Image (Optional)</Label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  id="mission-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, "mission_image")
                  }}
                  className="cursor-pointer"
                  disabled={isUploading === "mission_image"}
                />
              </div>
              {isUploading === "mission_image" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
            {content.mission_image && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Current image:</p>
                <img
                  src={content.mission_image || "/placeholder.svg"}
                  alt="Mission"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story Section */}
      <Card>
        <CardHeader>
          <CardTitle>Story Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="story-title">Section Title</Label>
            <Input
              id="story-title"
              value={content.story_title}
              onChange={(e) => setContent({ ...content, story_title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="story-content">Content</Label>
            <Textarea
              id="story-content"
              value={content.story_content}
              onChange={(e) => setContent({ ...content, story_content: e.target.value })}
              rows={6}
            />
          </div>
          <div>
            <Label htmlFor="story-image">Image (Optional)</Label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  id="story-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, "story_image")
                  }}
                  className="cursor-pointer"
                  disabled={isUploading === "story_image"}
                />
              </div>
              {isUploading === "story_image" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
            {content.story_image && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">Current image:</p>
                <img
                  src={content.story_image || "/placeholder.svg"}
                  alt="Story"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Sections */}
      {content.additional_sections.map((section, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Additional Section {index + 1}</CardTitle>
            <Button variant="destructive" size="sm" onClick={() => removeSection(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input value={section.title} onChange={(e) => updateSection(index, "title", e.target.value)} />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={section.content}
                onChange={(e) => updateSection(index, "content", e.target.value)}
                rows={6}
              />
            </div>
            <div>
              <Label>Image (Optional)</Label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, `section_${index}`, index)
                    }}
                    className="cursor-pointer"
                    disabled={isUploading === `section_${index}`}
                  />
                </div>
                {isUploading === `section_${index}` && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              {section.image && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">Current image:</p>
                  <img
                    src={section.image || "/placeholder.svg"}
                    alt={section.title}
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addSection} variant="outline" className="w-full bg-transparent">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Section
      </Button>

      {/* Optional Button */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Action Button (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="button-text">Button Text</Label>
            <Input
              id="button-text"
              placeholder="e.g., Support My Mission"
              value={content.button_text}
              onChange={(e) => setContent({ ...content, button_text: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="button-url">Button URL</Label>
            <Input
              id="button-url"
              placeholder="/giving"
              value={content.button_url}
              onChange={(e) => setContent({ ...content, button_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="flex-1">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href={`/${tenantSlug}/about`} target="_blank" rel="noopener noreferrer">
            Preview
          </a>
        </Button>
      </div>
    </div>
  )
}
