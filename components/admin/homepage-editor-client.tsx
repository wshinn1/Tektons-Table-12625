"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Upload,
  GripVertical,
  Blocks,
  Layout,
  Sparkles,
  Wand2,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BuilderSectionPicker } from "./builder-section-picker"
import { BuilderSectionEditor } from "./builder-section-editor"
import { ScreenshotSectionCreator } from "./screenshot-section-creator"

interface HomepageSection {
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
  content: any
  display_order: number
  is_active: boolean
  source_type?: "built_in" | "builder_io" | "screenshot"
  builder_section_id?: string | null
  section_template_id?: string | null
  section_templates?: {
    id: string
    name: string
    component_path: string | null
    field_schema: {
      fields: Array<{
        key: string // Changed from name to key
        type: string
        label: string
        required?: boolean
        options?: Array<{ value: string; label: string }>
        defaultValue?: any
        min?: number
        max?: number
      }>
    } | null
    default_props: any
  } | null
}

interface Props {
  sections: HomepageSection[]
  templates: Array<{
    id: string
    name: string
    description: string
    category: string
    thumbnail_url: string | null
    field_schema?: any
    default_props?: any
    component_path?: string | null
  }>
}

export function HomepageEditorClient({ sections: initialSections, templates }: Props) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingSections, setUploadingSections] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSectionType, setNewSectionType] = useState("")
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [newSectionSource, setNewSectionSource] = useState<"built_in" | "builder_io" | "screenshot">("built_in")

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return

    setSections((prev) => {
      const newSections = [...prev]
      const [moved] = newSections.splice(index, 1)
      newSections.splice(newIndex, 0, moved)
      // Update display_order for all sections
      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })
  }

  const handleInsertBuiltInSection = () => {
    if (!newSectionType) return

    const selectedTemplate = templates.find((t) => t.id === newSectionType)

    const newSection: HomepageSection = {
      id: `new-${Date.now()}`,
      section_key: `${selectedTemplate?.category || "section"}_${Date.now()}`,
      section_type: selectedTemplate?.category || "hero",
      title: selectedTemplate?.name || "New Section",
      subtitle: null,
      background_type: "color",
      background_value: "#ffffff",
      button_text: null,
      button_url: null,
      button_color: null,
      content:
        selectedTemplate?.default_props || (selectedTemplate?.category === "features_grid" ? { features: [] } : {}),
      display_order: insertAtIndex ?? sections.length,
      is_active: true,
      source_type: "built_in",
      builder_section_id: null,
      section_template_id: selectedTemplate?.id || null,
      section_templates: selectedTemplate
        ? {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            component_path: selectedTemplate.component_path || null,
            field_schema: selectedTemplate.field_schema || null,
            default_props: selectedTemplate.default_props || null,
          }
        : null,
    }

    setSections((prev) => {
      const newSections = [...prev]
      const idx = insertAtIndex ?? newSections.length
      newSections.splice(idx, 0, newSection)
      // Update display_order for all sections
      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })

    setIsAddDialogOpen(false)
    setNewSectionType("")
    setNewSectionSource("built_in")
    setInsertAtIndex(null)

    // Expand the new section
    setExpandedSections((prev) => ({ ...prev, [newSection.id]: true }))
    toast.success("Section added! Don't forget to save your changes.")
  }

  const handleInsertBuilderSection = (section: { id: string; name: string; category: string }) => {
    const newSection: HomepageSection = {
      id: `new-${Date.now()}`,
      section_key: `builder_${section.id}_${Date.now()}`,
      section_type: "builder",
      title: section.name,
      subtitle: null,
      background_type: "color",
      background_value: "#ffffff",
      button_text: null,
      button_url: null,
      button_color: null,
      content: {},
      display_order: insertAtIndex ?? sections.length,
      is_active: true,
      source_type: "builder_io",
      builder_section_id: section.id,
    }

    setSections((prev) => {
      const newSections = [...prev]
      const idx = insertAtIndex ?? newSections.length
      newSections.splice(idx, 0, newSection)
      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })

    setIsAddDialogOpen(false)
    setNewSectionSource("built_in")
    setInsertAtIndex(null)

    setExpandedSections((prev) => ({ ...prev, [newSection.id]: true }))
    toast.success("Builder.io section added! Edit it in Builder.io, then save your changes.")
  }

  const deleteSection = async (index: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    const sectionToDelete = sections[index]

    // If it's a new section (not saved yet), just remove from state
    if (String(sectionToDelete.id).startsWith("new-")) {
      setSections((prev) => {
        const newSections = prev.filter((_, i) => i !== index)
        return newSections.map((s, i) => ({ ...s, display_order: i }))
      })
      toast.success("Section removed.")
      return
    }

    try {
      // Mark the section as inactive and update display orders
      const updatedSections = sections.map((section, i) => {
        if (i === index) {
          return { ...section, is_active: false }
        }
        // Update display order for sections after the deleted one
        if (i > index) {
          return { ...section, display_order: section.display_order - 1 }
        }
        return section
      })

      console.log("[v0] Deleting section at index", index, "ID:", sectionToDelete.id)

      // Send ALL sections including the inactive one so it gets saved
      const response = await fetch("/api/admin/homepage-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      })

      if (!response.ok) throw new Error("Failed to delete section")

      // Only after successful API call, remove from local state
      setSections(updatedSections.filter((s) => s.is_active !== false))
      toast.success("Section deleted successfully")
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section")
    }
  }

  const updateSection = (id: string, updates: Partial<HomepageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const updateContent = (id: string, key: string, value: any) => {
    console.log("[v0] Updating content for section:", id, "key:", key, "value:", value)
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const processedValue =
            typeof value === "string" && (value === "true" || value === "false") ? value === "true" : value
          return {
            ...s,
            content: {
              ...s.content,
              [key]: processedValue,
            },
          }
        }
        return s
      }),
    )
  }

  const addFeature = (id: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id && s.section_type === "features_grid") {
          return {
            ...s,
            content: {
              ...s.content,
              features: [
                ...(s.content.features || []),
                {
                  icon: "circle",
                  title: "New Feature",
                  description: "Feature description",
                  badge: "",
                  badgeColor: "#ef4444",
                },
              ],
            },
          }
        }
        return s
      }),
    )
  }

  const removeFeature = (sectionId: string, featureIndex: number) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && s.section_type === "features_grid") {
          return {
            ...s,
            content: {
              ...s.content,
              features: s.content.features.filter((_: any, i: number) => i !== featureIndex),
            },
          }
        }
        return s
      }),
    )
  }

  const updateFeature = (sectionId: string, featureIndex: number, updates: any) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && s.section_type === "features_grid") {
          return {
            ...s,
            content: {
              ...s.content,
              features: s.content.features.map((f: any, i: number) => (i === featureIndex ? { ...f, ...updates } : f)),
            },
          }
        }
        return s
      }),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log("[v0] Saving sections:", sections)

      const response = await fetch("/api/admin/homepage-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Save failed:", errorData)
        throw new Error("Failed to save")
      }

      const result = await response.json()
      console.log("[v0] Save successful:", result)

      toast.success("Homepage sections saved successfully!")
    } catch (error) {
      console.error("Error saving sections:", error)
      toast.error("Failed to save sections")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (sectionId: string, file: File) => {
    setUploadingSections((prev) => ({ ...prev, [sectionId]: true }))

    try {
      const hostname = window.location.hostname
      const parts = hostname.split(".")

      // Only pass tenantId if it looks like a subdomain (not the main domain)
      const isRootDomain = parts.length <= 2 || parts[0] === "www" || parts[0] === hostname.replace(/\..+$/, "")

      const formData = new FormData()
      formData.append("file", file)
      // Don't pass tenantId for root domain - API will handle as platform upload
      if (!isRootDomain && parts[0]) {
        formData.append("tenantId", parts[0])
      }

      const response = await fetch("/api/tenant/upload-media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()

      updateSection(sectionId, {
        background_type: "image",
        background_value: data.url,
      })

      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploadingSections((prev) => ({ ...prev, [sectionId]: false }))
    }
  }

  const handleFieldImageUpload = async (sectionId: string, fieldKey: string, file: File) => {
    setUploadingSections((prev) => ({ ...prev, [sectionId]: true }))

    try {
      const hostname = window.location.hostname
      const parts = hostname.split(".")
      const isRootDomain = parts.length <= 2 || parts[0] === "www" || parts[0] === hostname.replace(/\..+$/, "")

      const formData = new FormData()
      formData.append("file", file)
      if (!isRootDomain && parts[0]) {
        formData.append("tenantId", parts[0])
      }

      const response = await fetch("/api/tenant/upload-media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      updateContent(sectionId, fieldKey, data.url)

      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploadingSections((prev) => ({ ...prev, [sectionId]: false }))
    }
  }

  const AddSectionDialog = ({ triggerButton, atIndex }: { triggerButton: React.ReactNode; atIndex?: number }) => (
    <Dialog
      open={isAddDialogOpen && insertAtIndex === atIndex}
      onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (open) {
          setInsertAtIndex(atIndex ?? null)
          setNewSectionSource("built_in")
        }
      }}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden z-50">
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            Choose a section source and type to add{insertAtIndex !== null ? ` at position ${insertAtIndex + 1}` : ""}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={newSectionSource}
          onValueChange={(v) => setNewSectionSource(v as "built_in" | "builder_io" | "screenshot")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="built_in" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Built-in Templates
            </TabsTrigger>
            <TabsTrigger value="builder_io" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Builder.io Sections
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              From Screenshot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screenshot" className="overflow-y-auto max-h-[calc(85vh-180px)]">
            <ScreenshotSectionCreator
              onSectionCreated={(code, preview) => {
                const newSection = {
                  id: `new-${Date.now()}`,
                  section_key: `screenshot_${Date.now()}`,
                  section_type: "custom",
                  source_type: "screenshot",
                  content: {
                    code,
                    preview,
                  },
                  display_order: insertAtIndex !== null ? insertAtIndex : sections.length,
                }
                if (insertAtIndex !== null) {
                  const newSections = [...sections]
                  newSections.splice(insertAtIndex, 0, newSection)
                  setSections(newSections.map((s, i) => ({ ...s, display_order: i })))
                } else {
                  setSections([...sections, newSection])
                }
                setIsAddDialogOpen(false)
                toast.success("Custom section added!")
              }}
            />
          </TabsContent>

          <TabsContent value="built_in" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-type">Section Type</Label>
                <Select value={newSectionType} onValueChange={setNewSectionType}>
                  <SelectTrigger id="section-type" className="w-full">
                    <SelectValue placeholder="Select a section type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] z-[100]" position="popper" sideOffset={4}>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInsertBuiltInSection} disabled={!newSectionType}>
                  Add Section
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>

          <TabsContent value="builder_io" className="mt-4">
            <BuilderSectionPicker onSelect={handleInsertBuilderSection} onCancel={() => setIsAddDialogOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AddSectionDialog
          triggerButton={
            <Button variant="outline" onClick={() => setInsertAtIndex(sections.length)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          }
          atIndex={sections.length}
        />
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {sections.length === 0 && (
        <Card className="p-12 text-center border-2 border-dashed">
          <p className="text-muted-foreground mb-4">No sections yet. Add your first section to get started.</p>
          <AddSectionDialog
            triggerButton={
              <Button onClick={() => setInsertAtIndex(0)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Section
              </Button>
            }
            atIndex={0}
          />
        </Card>
      )}

      {sections
        .filter((s) => s.is_active !== false)
        .map((section, index) => {
          const isExpanded = expandedSections[section.id]
          const isUploading = uploadingSections[section.id]
          const isBuilder = section.source_type === "builder_io"
          const isScreenshot = section.source_type === "screenshot"

          return (
            <div key={section.id}>
              {index === 0 && (
                <div className="flex justify-center py-2">
                  <AddSectionDialog
                    triggerButton={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => setInsertAtIndex(0)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Insert section here
                      </Button>
                    }
                    atIndex={0}
                  />
                </div>
              )}

              <Card className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold">{section.title || section.section_key}</h3>
                          {isBuilder ? (
                            <Badge variant="secondary" className="text-xs">
                              <Blocks className="w-3 h-3 mr-1" />
                              Builder.io
                            </Badge>
                          ) : isScreenshot ? (
                            <Badge variant="secondary" className="text-xs">
                              <Wand2 className="w-3 h-3 mr-1" />
                              Screenshot
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <Layout className="w-3 h-3 mr-1" />
                              Built-in
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{section.section_key}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-6 mt-4">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteSection(index)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Section
                          </Button>
                        </div>

                        {isBuilder ? (
                          <BuilderSectionEditor sectionId={section.builder_section_id || ""} onUpdate={() => {}} />
                        ) : isScreenshot ? (
                          <div>
                            <Label>Code</Label>
                            <Textarea
                              value={section.content.code || ""}
                              onChange={(e) => updateContent(section.id, "code", e.target.value)}
                              rows={10}
                              className="font-mono text-sm"
                            />
                            <Label className="mt-2">Preview</Label>
                            <div className="mt-1 rounded-md border overflow-hidden w-full max-w-sm">
                              <img
                                src={section.content.preview || "/placeholder.svg"}
                                alt="Screenshot preview"
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/invalid-image.jpg"
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Built-in section editor (existing code) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Title</Label>
                                <Input
                                  value={section.title || ""}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                  placeholder="Section title"
                                />
                              </div>
                              <div>
                                <Label>Subtitle</Label>
                                <Input
                                  value={section.subtitle || ""}
                                  onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                                  placeholder="Section subtitle"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Background Type</Label>
                                  <select
                                    value={section.background_type}
                                    onChange={(e) => updateSection(section.id, { background_type: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  >
                                    <option value="color">Solid Color</option>
                                    <option value="image">Image URL</option>
                                    <option value="video">Video CDN URL</option>
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <Label>
                                    {section.background_type === "color"
                                      ? "Background Color (hex)"
                                      : section.background_type === "image"
                                        ? "Image URL"
                                        : "Video CDN URL"}
                                  </Label>
                                  <div className="flex gap-2">
                                    {section.background_type === "color" && (
                                      <input
                                        type="color"
                                        value={section.background_value || "#ffffff"}
                                        onChange={(e) =>
                                          updateSection(section.id, { background_value: e.target.value })
                                        }
                                        className="h-10 w-14 rounded border cursor-pointer p-1"
                                      />
                                    )}
                                    <Input
                                      value={section.background_value || ""}
                                      onChange={(e) => updateSection(section.id, { background_value: e.target.value })}
                                      placeholder={
                                        section.background_type === "color"
                                          ? "#f5f5f5"
                                          : section.background_type === "image"
                                            ? "https://example.com/image.jpg"
                                            : "https://cdn.example.com/video.mp4"
                                      }
                                      className="flex-1"
                                    />
                                    {section.background_type === "image" && (
                                      <Button type="button" variant="outline" size="sm" disabled={isUploading} asChild>
                                        <label className="cursor-pointer">
                                          <Upload className="w-4 h-4 mr-2" />
                                          {isUploading ? "Uploading..." : "Upload"}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0]
                                              if (file) handleImageUpload(section.id, file)
                                            }}
                                            disabled={isUploading}
                                          />
                                        </label>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {section.background_type === "image" && section.background_value && (
                                <div className="mt-2">
                                  <Label className="text-sm text-muted-foreground">Preview</Label>
                                  <div className="mt-1 rounded-md border overflow-hidden w-full max-w-sm">
                                    <img
                                      src={section.background_value || "/placeholder.svg"}
                                      alt="Background preview"
                                      className="w-full h-32 object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = "/invalid-image.jpg"
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {section.section_templates?.field_schema?.fields && (
                                <div className="space-y-4 border-t pt-4 mt-4">
                                  <h4 className="font-medium text-sm text-muted-foreground">Template Fields</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.section_templates.field_schema.fields.map((field: any) => (
                                      <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                                        <Label>
                                          {field.label}
                                          {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        {field.type === "text" && (
                                          <Input
                                            value={section.content?.[field.key] || ""}
                                            onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                            placeholder={field.label}
                                          />
                                        )}
                                        {field.type === "textarea" && (
                                          <Textarea
                                            value={section.content?.[field.key] || ""}
                                            onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                            placeholder={field.label}
                                            rows={3}
                                          />
                                        )}
                                        {field.type === "url" && (
                                          <Input
                                            type="url"
                                            value={section.content?.[field.key] || ""}
                                            onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                            placeholder="https://..."
                                          />
                                        )}
                                        {field.type === "image" && (
                                          <div className="space-y-2">
                                            <Input
                                              type="url"
                                              value={section.content?.[field.key] || ""}
                                              onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                              placeholder="Image URL"
                                            />
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              disabled={isUploading}
                                              asChild
                                            >
                                              <label className="cursor-pointer">
                                                <Upload className="w-4 h-4 mr-2" />
                                                {isUploading ? "Uploading..." : "Upload Image"}
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleFieldImageUpload(section.id, field.key, file)
                                                  }}
                                                  disabled={isUploading}
                                                />
                                              </label>
                                            </Button>
                                            {section.content?.[field.key] && (
                                              <div className="mt-2">
                                                <Label className="text-sm text-muted-foreground">Preview</Label>
                                                <div className="mt-1 rounded-md border overflow-hidden w-full max-w-sm">
                                                  <img
                                                    src={section.content[field.key] || "/placeholder.svg"}
                                                    alt="Field image preview"
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => {
                                                      e.currentTarget.src = "/placeholder.svg?height=128&width=400"
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {field.type === "select" && field.options && (
                                          <Select
                                            value={section.content?.[field.key] || ""}
                                            onValueChange={(value) => updateContent(section.id, field.key, value)}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder={`Select ${field.label}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {field.options.map((opt: any) => {
                                                const value = typeof opt === "string" ? opt : opt.value
                                                const label =
                                                  typeof opt === "string"
                                                    ? opt.charAt(0).toUpperCase() + opt.slice(1)
                                                    : opt.label
                                                return (
                                                  <SelectItem key={value} value={value}>
                                                    {label}
                                                  </SelectItem>
                                                )
                                              })}
                                            </SelectContent>
                                          </Select>
                                        )}
                                        {field.type === "color" && (
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="color"
                                              value={section.content?.[field.key] || field.defaultValue || "#000000"}
                                              onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                              className="h-10 w-20 rounded border cursor-pointer"
                                            />
                                            <Input
                                              value={section.content?.[field.key] || field.defaultValue || ""}
                                              onChange={(e) => updateContent(section.id, field.key, e.target.value)}
                                              placeholder="#000000"
                                              className="flex-1"
                                            />
                                          </div>
                                        )}
                                        {field.type === "number" && (
                                          <div className="space-y-2">
                                            <Input
                                              type="number"
                                              min={field.min}
                                              max={field.max}
                                              value={section.content?.[field.key] ?? field.defaultValue ?? ""}
                                              onChange={(e) =>
                                                updateContent(section.id, field.key, Number(e.target.value))
                                              }
                                              placeholder={field.defaultValue?.toString()}
                                            />
                                            {field.min !== undefined && field.max !== undefined && (
                                              <input
                                                type="range"
                                                min={field.min}
                                                max={field.max}
                                                value={section.content?.[field.key] ?? field.defaultValue ?? field.min}
                                                onChange={(e) =>
                                                  updateContent(section.id, field.key, Number(e.target.value))
                                                }
                                                className="w-full"
                                              />
                                            )}
                                          </div>
                                        )}
                                        {field.type === "boolean" && (
                                          <div className="flex items-center gap-2 pt-2">
                                            <Switch
                                              checked={section.content?.[field.key] ?? field.defaultValue ?? false}
                                              onCheckedChange={(checked) =>
                                                updateContent(section.id, field.key, checked)
                                              }
                                            />
                                            <span className="text-sm text-muted-foreground">
                                              {(section.content?.[field.key] ?? field.defaultValue)
                                                ? "Enabled"
                                                : "Disabled"}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {section.section_type === "cta" && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Button Text</Label>
                                  <Input
                                    value={section.button_text || ""}
                                    onChange={(e) => updateSection(section.id, { button_text: e.target.value })}
                                    placeholder="Get started for free"
                                  />
                                </div>
                                <div>
                                  <Label>Button URL</Label>
                                  <Input
                                    value={section.button_url || ""}
                                    onChange={(e) => updateSection(section.id, { button_url: e.target.value })}
                                    placeholder="/auth/signup"
                                  />
                                </div>
                                <div>
                                  <Label>Button Color (hex)</Label>
                                  <Input
                                    value={section.button_color || ""}
                                    onChange={(e) => updateSection(section.id, { button_color: e.target.value })}
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>
                            )}

                            {section.section_type === "features_grid" && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Label className="text-base">Features</Label>
                                  <Button onClick={() => addFeature(section.id)} size="sm" variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Feature
                                  </Button>
                                </div>

                                {section.content.features?.map((feature: any, featureIndex: number) => (
                                  <Card key={featureIndex} className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-medium">Feature {featureIndex + 1}</h4>
                                      <Button
                                        onClick={() => removeFeature(section.id, featureIndex)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <div className="grid gap-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Icon (Lucide name)</Label>
                                          <Input
                                            value={feature.icon || ""}
                                            onChange={(e) =>
                                              updateFeature(section.id, featureIndex, { icon: e.target.value })
                                            }
                                            placeholder="mail"
                                          />
                                        </div>
                                        <div>
                                          <Label>Title</Label>
                                          <Input
                                            value={feature.title || ""}
                                            onChange={(e) =>
                                              updateFeature(section.id, featureIndex, { title: e.target.value })
                                            }
                                            placeholder="Feature title"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <Label>Description</Label>
                                        <Textarea
                                          value={feature.description || ""}
                                          onChange={(e) =>
                                            updateFeature(section.id, featureIndex, { description: e.target.value })
                                          }
                                          placeholder="Feature description"
                                          rows={2}
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Badge Text (optional)</Label>
                                          <Input
                                            value={feature.badge || ""}
                                            onChange={(e) =>
                                              updateFeature(section.id, featureIndex, { badge: e.target.value })
                                            }
                                            placeholder="Saves $240/year"
                                          />
                                        </div>
                                        <div>
                                          <Label>Badge Color (hex)</Label>
                                          <Input
                                            value={feature.badgeColor || ""}
                                            onChange={(e) =>
                                              updateFeature(section.id, featureIndex, { badgeColor: e.target.value })
                                            }
                                            placeholder="#ef4444"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {section.section_type === "cta" && section.content.supportingText && (
                              <div>
                                <Label>Supporting Text (below button)</Label>
                                <Input
                                  value={section.content.supportingText || ""}
                                  onChange={(e) => updateContent(section.id, "supportingText", e.target.value)}
                                  placeholder="No credit card required • Setup in 5 minutes"
                                />
                              </div>
                            )}

                            {(section.section_type === "pricing_comparison" ||
                              section.section_type === "benefits_columns") && (
                              <div>
                                <Label>Content (JSON)</Label>
                                <Textarea
                                  value={JSON.stringify(section.content, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value)
                                      updateSection(section.id, { content: parsed })
                                    } catch (err) {
                                      // Invalid JSON, don't update
                                    }
                                  }}
                                  rows={15}
                                  className="font-mono text-sm"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  Edit the JSON directly for this section type
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="flex justify-center py-2">
                <AddSectionDialog
                  triggerButton={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setInsertAtIndex(index + 1)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Insert section here
                    </Button>
                  }
                  atIndex={index + 1}
                />
              </div>
            </div>
          )
        })}
    </div>
  )
}
