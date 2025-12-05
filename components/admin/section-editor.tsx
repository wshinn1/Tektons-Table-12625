"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Eye, Code, Settings, Trash2, Copy, ImageIcon, Plus, X } from "lucide-react"
import { updateSectionTemplate, deleteSectionTemplate, duplicateSectionTemplate } from "@/app/actions/sections"
import { SectionPreview } from "./section-preview"
import { SectionFieldEditor } from "./section-field-editor"
import Link from "next/link"

const CATEGORIES = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features" },
  { value: "testimonials", label: "Testimonials" },
  { value: "pricing", label: "Pricing" },
  { value: "cta", label: "Call to Action" },
  { value: "footer", label: "Footer" },
  { value: "content", label: "Content" },
  { value: "gallery", label: "Gallery" },
  { value: "stats", label: "Statistics" },
  { value: "team", label: "Team" },
  { value: "faq", label: "FAQ" },
  { value: "contact", label: "Contact" },
]

interface EditableField {
  id: string
  label: string
  type: "text" | "textarea" | "image" | "color" | "button" | "link" | "number" | "boolean"
  defaultValue: string
  placeholder?: string
}

interface SectionEditorProps {
  section: {
    id: string
    name: string
    category: string
    description?: string
    default_props?: Record<string, string>
    editable_fields?: EditableField[]
    generated_html?: string
    thumbnail_url?: string
    original_screenshot_url?: string
    source_type?: string
  }
}

export function SectionEditor({ section }: SectionEditorProps) {
  const router = useRouter()
  const [name, setName] = useState(section.name)
  const [category, setCategory] = useState(section.category)
  const [description, setDescription] = useState(section.description || "")
  const [html, setHtml] = useState(section.generated_html || "")
  const [editableFields, setEditableFields] = useState<EditableField[]>(section.editable_fields || [])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(section.default_props || {})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("fields")

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      await updateSectionTemplate(section.id, {
        name,
        category,
        description,
        generated_html: html,
        editable_fields: editableFields,
        default_props: fieldValues,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this section? This cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSectionTemplate(section.id)
      router.push("/admin/sections")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const copy = await duplicateSectionTemplate(section.id)
      router.push(`/admin/sections/${copy.id}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate")
      setIsDuplicating(false)
    }
  }

  const addField = () => {
    const newField: EditableField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      defaultValue: "",
      placeholder: "",
    }
    setEditableFields([...editableFields, newField])
  }

  const updateField = (index: number, updates: Partial<EditableField>) => {
    const updated = [...editableFields]
    updated[index] = { ...updated[index], ...updates }
    setEditableFields(updated)
  }

  const removeField = (index: number) => {
    const fieldId = editableFields[index].id
    setEditableFields(editableFields.filter((_, i) => i !== index))
    const newValues = { ...fieldValues }
    delete newValues[fieldId]
    setFieldValues(newValues)
  }

  const renderPreviewHtml = () => {
    let previewHtml = html
    Object.entries(fieldValues).forEach(([key, value]) => {
      previewHtml = previewHtml.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return previewHtml
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/sections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {category} Section
              {section.source_type === "ai-generated" && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI Generated</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Duplicate</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Delete</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{error}</div>}

      {/* Original Screenshot */}
      {section.original_screenshot_url && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Original Screenshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={section.original_screenshot_url || "/placeholder.svg"}
              alt="Original screenshot"
              className="max-h-48 rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Settings & Fields */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="fields" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Fields
              </TabsTrigger>
              <TabsTrigger value="html" className="flex-1">
                <Code className="h-4 w-4 mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fields" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Editable Fields</CardTitle>
                    <Button variant="outline" size="sm" onClick={addField}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editableFields.length > 0 ? (
                    <div className="space-y-4">
                      {editableFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Field ID</Label>
                                <Input
                                  value={field.id}
                                  onChange={(e) => updateField(index, { id: e.target.value })}
                                  className="mt-1 font-mono text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeField(index)}
                              className="text-muted-foreground hover:text-destructive ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(v) => updateField(index, { type: v as EditableField["type"] })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="textarea">Textarea</SelectItem>
                                  <SelectItem value="image">Image</SelectItem>
                                  <SelectItem value="color">Color</SelectItem>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="button">Button</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Default Value</Label>
                              <Input
                                value={field.defaultValue}
                                onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No editable fields. Click "Add Field" to create one.
                    </p>
                  )}

                  {editableFields.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-medium mb-3">Field Values</h4>
                      <SectionFieldEditor fields={editableFields} values={fieldValues} onChange={setFieldValues} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="html" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">HTML Template</CardTitle>
                  <p className="text-sm text-muted-foreground">Use {"{{field_id}}"} syntax for dynamic content</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="<section class='py-16'>...</section>"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Section Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SectionPreview html={renderPreviewHtml()} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
