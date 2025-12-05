"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface AboutSection {
  id: string
  section_key: string
  section_type: string
  title: string | null
  subtitle: string | null
  background_type: string
  background_value: string | null
  button_text: string | null
  button_url: string | null
  button_color: string | null
  image_url: string | null
  content: any
  display_order: number
  is_active: boolean
  text_color?: string | null
}

interface AboutEditorClientProps {
  initialSections: AboutSection[]
}

export function AboutEditorClient({ initialSections }: AboutEditorClientProps) {
  const [sections, setSections] = useState<AboutSection[]>(initialSections)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  const updateSection = (index: number, updates: Partial<AboutSection>) => {
    setSections((prev) => {
      const newSections = [...prev]
      newSections[index] = { ...newSections[index], ...updates }
      return newSections
    })
  }

  const updateContent = (index: number, key: string, value: any) => {
    setSections((prev) => {
      const newSections = [...prev]
      newSections[index] = {
        ...newSections[index],
        content: {
          ...newSections[index].content,
          [key]: value,
        },
      }
      return newSections
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/about-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success("About page updated successfully!")
    } catch (error) {
      toast.error("Failed to save changes")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (index: number, key: string, file: File) => {
    const uploadKey = `${index}-${key}`
    setUploading((prev) => ({ ...prev, [uploadKey]: true }))

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      updateContent(index, key, url)
      toast.success("Image uploaded successfully!")
    } catch (error) {
      toast.error("Failed to upload image")
      console.error(error)
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <Card key={section.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold capitalize">{section.section_key.replace(/_/g, " ")} Section</h3>
              <span className="text-sm text-gray-500">Order: {section.display_order}</span>
            </div>

            {/* Background Type Selector */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label>Background Type</Label>
                <Select
                  value={section.background_type || "color"}
                  onValueChange={(value) => updateSection(index, { background_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Solid Color</SelectItem>
                    <SelectItem value="image">Image URL</SelectItem>
                    <SelectItem value="video">Video CDN Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {section.background_type === "color"
                    ? "Background Color (Hex or Tailwind)"
                    : section.background_type === "image"
                      ? "Image URL"
                      : "Video CDN URL"}
                </Label>
                <Input
                  value={section.background_value || ""}
                  onChange={(e) => updateSection(index, { background_value: e.target.value })}
                  placeholder={
                    section.background_type === "color"
                      ? "#f5f5f5 or bg-gray-100"
                      : section.background_type === "image"
                        ? "https://..."
                        : "https://cdn.example.com/video.mp4"
                  }
                />
              </div>
            </div>

            {/* Hero Section */}
            {section.section_type === "hero" && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.text_color || "#000000"}
                        onChange={(e) => updateSection(index, { text_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.text_color || "#000000"}
                        onChange={(e) => updateSection(index, { text_color: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Subtitle Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.content?.subtitleColor || "#666666"}
                        onChange={(e) =>
                          updateSection(index, {
                            content: { ...section.content, subtitleColor: e.target.value },
                          })
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.content?.subtitleColor || "#666666"}
                        onChange={(e) =>
                          updateSection(index, {
                            content: { ...section.content, subtitleColor: e.target.value },
                          })
                        }
                        placeholder="#666666"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tekton Origin Section */}
            {section.section_type === "tekton_origin" && (
              <>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Background (Tailwind class)</Label>
                  <Input
                    value={section.background_value || ""}
                    onChange={(e) => updateSection(index, { background_value: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={section.content.paragraph1 || ""}
                    onChange={(e) => updateContent(index, "paragraph1", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={section.content.paragraph2 || ""}
                    onChange={(e) => updateContent(index, "paragraph2", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Workshop Title</Label>
                  <Input
                    value={section.content.workshop_title || ""}
                    onChange={(e) => updateContent(index, "workshop_title", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Workshop Paragraph 1</Label>
                  <Textarea
                    value={section.content.workshop_paragraph1 || ""}
                    onChange={(e) => updateContent(index, "workshop_paragraph1", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Workshop Paragraph 2</Label>
                  <Textarea
                    value={section.content.workshop_paragraph2 || ""}
                    onChange={(e) => updateContent(index, "workshop_paragraph2", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Highlighted Text</Label>
                  <Textarea
                    value={section.content.highlighted_text || ""}
                    onChange={(e) => updateContent(index, "highlighted_text", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Highlighted Text Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.highlighted_text_color || "#f5a390"}
                    onChange={(e) => updateContent(index, "highlighted_text_color", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Tekton Explanation Section */}
            {section.section_type === "tekton_explanation" && (
              <>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Main Text</Label>
                  <Textarea
                    value={section.content.mainText || ""}
                    onChange={(e) => updateContent(index, "mainText", e.target.value)}
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Workshop Title</Label>
                  <Input
                    value={section.content.workshopTitle || ""}
                    onChange={(e) => updateContent(index, "workshopTitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Workshop Text</Label>
                  <Textarea
                    value={section.content.workshopText || ""}
                    onChange={(e) => updateContent(index, "workshopText", e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Highlighted Text</Label>
                  <Textarea
                    value={section.content.highlightedText || ""}
                    onChange={(e) => updateContent(index, "highlightedText", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Highlighted Text Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.highlightedTextColor || "#f5a390"}
                    onChange={(e) => updateContent(index, "highlightedTextColor", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Founder Profile Section */}
            {section.section_type === "founder_profile" && (
              <>
                <div>
                  <Label>Name/Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle (Position)</Label>
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.subtitle_color || "#f5a390"}
                    onChange={(e) => updateContent(index, "subtitle_color", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={section.content.image_url || ""}
                    onChange={(e) => updateContent(index, "image_url", e.target.value)}
                    placeholder="/images/wes-shinn.jpg or CDN URL"
                  />
                </div>
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={section.content.paragraph1 || ""}
                    onChange={(e) => updateContent(index, "paragraph1", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={section.content.paragraph2 || ""}
                    onChange={(e) => updateContent(index, "paragraph2", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 3 (Bold)</Label>
                  <Textarea
                    value={section.content.paragraph3 || ""}
                    onChange={(e) => updateContent(index, "paragraph3", e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Profile Section */}
            {section.section_type === "profile" && (
              <>
                <div>
                  <Label>Name/Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle (Position)</Label>
                  <Input
                    value={section.content.subtitle || ""}
                    onChange={(e) => updateContent(index, "subtitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.subtitleColor || "#f5a390"}
                    onChange={(e) => updateContent(index, "subtitleColor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    {section.content.imageUrl && (
                      <img
                        src={section.content.imageUrl || "/placeholder.svg"}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(index, "imageUrl", file)
                        }}
                        disabled={uploading[`${index}-imageUrl`]}
                        className="cursor-pointer"
                      />
                      <Input
                        value={section.content.imageUrl || ""}
                        onChange={(e) => updateContent(index, "imageUrl", e.target.value)}
                        placeholder="Or paste image URL"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {uploading[`${index}-imageUrl`] && <p className="text-sm text-muted-foreground">Uploading...</p>}
                </div>
                <div>
                  <Label>Paragraph 1</Label>
                  <Textarea
                    value={section.content.paragraph1 || ""}
                    onChange={(e) => updateContent(index, "paragraph1", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 2</Label>
                  <Textarea
                    value={section.content.paragraph2 || ""}
                    onChange={(e) => updateContent(index, "paragraph2", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Paragraph 3 (Bold)</Label>
                  <Textarea
                    value={section.content.paragraph3 || ""}
                    onChange={(e) => updateContent(index, "paragraph3", e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Personal Values Section */}
            {section.section_type === "personal_values" && (
              <>
                <div>
                  <Label>Background (Tailwind class)</Label>
                  <Input
                    value={section.background_value || ""}
                    onChange={(e) => updateSection(index, { background_value: e.target.value })}
                  />
                </div>
                {section.content.values?.map((value: any, valueIndex: number) => (
                  <div key={valueIndex} className="border-l-4 border-accent pl-4 space-y-2">
                    <h4 className="font-semibold">Value {valueIndex + 1}</h4>
                    <div>
                      <Label>Icon (heart, globe, camera, etc.)</Label>
                      <Input
                        value={value.icon || ""}
                        onChange={(e) => {
                          const newValues = [...section.content.values]
                          newValues[valueIndex].icon = e.target.value
                          updateContent(index, "values", newValues)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={value.title || ""}
                        onChange={(e) => {
                          const newValues = [...section.content.values]
                          newValues[valueIndex].title = e.target.value
                          updateContent(index, "values", newValues)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={value.description || ""}
                        onChange={(e) => {
                          const newValues = [...section.content.values]
                          newValues[valueIndex].description = e.target.value
                          updateContent(index, "values", newValues)
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Facts Grid Section */}
            {section.section_type === "facts_grid" && (
              <>
                {section.content.facts?.map((fact: any, valueIndex: number) => (
                  <div key={valueIndex} className="border-l-4 border-accent pl-4 space-y-2">
                    <h4 className="font-semibold">Fact Card {valueIndex + 1}</h4>
                    <div>
                      <Label>Icon (heart, globe, camera, target)</Label>
                      <Input
                        value={fact.icon || ""}
                        onChange={(e) => {
                          const newFacts = [...section.content.facts]
                          newFacts[valueIndex].icon = e.target.value
                          updateContent(index, "facts", newFacts)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Icon Color (hex)</Label>
                      <Input
                        type="color"
                        value={fact.iconColor || "#f5a390"}
                        onChange={(e) => {
                          const newFacts = [...section.content.facts]
                          newFacts[valueIndex].iconColor = e.target.value
                          updateContent(index, "facts", newFacts)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={fact.title || ""}
                        onChange={(e) => {
                          const newFacts = [...section.content.facts]
                          newFacts[valueIndex].title = e.target.value
                          updateContent(index, "facts", newFacts)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={fact.description || ""}
                        onChange={(e) => {
                          const newFacts = [...section.content.facts]
                          newFacts[valueIndex].description = e.target.value
                          updateContent(index, "facts", newFacts)
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Mission Statement Section */}
            {section.section_type === "mission_statement" && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Main Text</Label>
                  <Textarea
                    value={section.content.mainText || ""}
                    onChange={(e) => updateContent(index, "mainText", e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Highlighted Text</Label>
                  <Textarea
                    value={section.content.highlightedText || ""}
                    onChange={(e) => updateContent(index, "highlightedText", e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Highlighted Text Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.highlightedTextColor || "#f5a390"}
                    onChange={(e) => updateContent(index, "highlightedTextColor", e.target.value)}
                  />
                </div>
              </>
            )}

            {/* CTA Section */}
            {section.section_type === "cta" && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={section.content.buttonText || ""}
                    onChange={(e) => updateContent(index, "buttonText", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Button URL</Label>
                  <Input
                    value={section.content.buttonUrl || ""}
                    onChange={(e) => updateContent(index, "buttonUrl", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Button Color (hex)</Label>
                  <Input
                    type="color"
                    value={section.content.buttonColor || "#000000"}
                    onChange={(e) => updateContent(index, "buttonColor", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Supporting Text</Label>
                  <Input
                    value={section.content.supportingText || ""}
                    onChange={(e) => updateContent(index, "supportingText", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
