"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { updatePageSection } from "@/app/actions/pages"
import { useRouter } from "next/navigation"
import { MediaLibraryModal } from "@/components/admin/media-library-modal"
import { ImageIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { BuilderSectionEditor } from "@/components/admin/builder-section-editor"

interface SectionEditorProps {
  section: any
  isPrismic?: boolean
  isBuilder?: boolean
}

export function SectionEditor({ section, isPrismic = false, isBuilder = false }: SectionEditorProps) {
  const router = useRouter()
  const [props, setProps] = useState(section.props || {})
  const [prismicContent, setPrismicContent] = useState(section.prismic_content || {})
  const [builderContent, setBuilderContent] = useState(section.builder_content || {})
  const [isSaving, setIsSaving] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [activeImageField, setActiveImageField] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Support both old field_schema format and new editable_fields format
  const template = section.section_templates
  const fieldSchema = template?.field_schema?.fields || []
  const editableFields = template?.editable_fields || []

  // Combine both field types
  const hasOldFields = fieldSchema.length > 0
  const hasNewFields = editableFields.length > 0

  const handleFieldChange = (fieldName: string, value: any) => {
    setProps((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handlePrismicContentChange = (content: any) => {
    setPrismicContent(content)
  }

  const handleBuilderContentChange = (content: any) => {
    setBuilderContent(content)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (isBuilder) {
        await updatePageSection(section.id, props, builderContent)
      } else if (isPrismic) {
        await updatePageSection(section.id, props, prismicContent)
      } else {
        await updatePageSection(section.id, props)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to save section:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const openMediaLibrary = (fieldName: string) => {
    setActiveImageField(fieldName)
    setMediaLibraryOpen(true)
  }

  const handleImageSelect = (url: string) => {
    if (activeImageField) {
      handleFieldChange(activeImageField, url)
      setActiveImageField(null)
    }
  }

  // Render preview HTML with field values substituted
  const renderPreviewHtml = () => {
    if (!template?.generated_html) return null

    let html = template.generated_html
    Object.entries(props).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), String(value))
    })
    return html
  }

  if (isBuilder) {
    return (
      <div className="space-y-4 py-4">
        <BuilderSectionEditor sectionId={section.builder_section_id} onUpdate={() => {}} />

        <Button onClick={handleSave} disabled={isSaving} className="mt-4">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Section"
          )}
        </Button>
      </div>
    )
  }

  if (isPrismic) {
    return (
      <div className="space-y-4 py-4">
        {/* Placeholder for PrismicSectionEditor */}
        {/* <PrismicSectionEditor
          sliceType={section.prismic_slice_type}
          content={prismicContent}
          onChange={handlePrismicContentChange}
        /> */}

        <Button onClick={handleSave} disabled={isSaving} className="mt-4">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Section"
          )}
        </Button>
      </div>
    )
  }

  // Render old-style field schema fields
  const renderSchemaField = (field: any) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.name}
            value={props[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="mt-1"
          />
        )
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={props[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="mt-1"
            rows={3}
          />
        )
      case "url":
        return (
          <div className="flex gap-2 mt-1">
            <Input
              id={field.name}
              type="url"
              value={props[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="flex-1"
              placeholder="https://..."
            />
            {(field.name.toLowerCase().includes("image") || field.name.toLowerCase().includes("background")) && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => openMediaLibrary(field.name)}
                title="Browse media library"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      case "color":
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={props[field.name] || field.default || "#000000"}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="h-10 w-20 rounded border cursor-pointer"
            />
            <Input
              value={props[field.name] || field.default || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="flex-1"
            />
          </div>
        )
      case "number":
        return (
          <Input
            id={field.name}
            type="number"
            min={field.min}
            max={field.max}
            value={props[field.name] || field.default || ""}
            onChange={(e) => handleFieldChange(field.name, Number.parseInt(e.target.value))}
            className="mt-1"
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center gap-2 mt-1">
            <Switch
              id={field.name}
              checked={props[field.name] !== undefined ? props[field.name] : field.default}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
          </div>
        )
      case "select":
        return (
          <select
            id={field.name}
            value={props[field.name] || field.default || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
          >
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      default:
        return (
          <Input
            id={field.name}
            value={props[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="mt-1"
          />
        )
    }
  }

  // Render new-style editable fields (from AI-generated sections)
  const renderEditableField = (field: any) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={props[field.id] || field.defaultValue || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="mt-1"
            rows={3}
          />
        )
      case "image":
        return (
          <div className="space-y-2 mt-1">
            <div className="flex gap-2">
              <Input
                id={field.id}
                value={props[field.id] || field.defaultValue || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder="Image URL..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => openMediaLibrary(field.id)}
                title="Browse media library"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            {(props[field.id] || field.defaultValue) && (
              <img
                src={props[field.id] || field.defaultValue || "/placeholder.svg"}
                alt="Preview"
                className="max-h-24 rounded border"
              />
            )}
          </div>
        )
      case "color":
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={props[field.id] || field.defaultValue || "#000000"}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="h-10 w-10 rounded border cursor-pointer"
            />
            <Input
              value={props[field.id] || field.defaultValue || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="flex-1"
            />
          </div>
        )
      case "boolean":
        return (
          <div className="flex items-center gap-2 mt-1">
            <Switch
              id={field.id}
              checked={(props[field.id] || field.defaultValue) === "true" || props[field.id] === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="text-sm text-muted-foreground capitalize">
              {props[field.id] === true || props[field.id] === "true" ? "Enabled" : "Disabled"}
            </Label>
          </div>
        )
      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={props[field.id] || field.defaultValue || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="mt-1"
          />
        )
      default:
        return (
          <Input
            id={field.id}
            value={props[field.id] || field.defaultValue || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="mt-1"
          />
        )
    }
  }

  return (
    <div className="space-y-4 py-4">
      {/* Old-style field schema */}
      {hasOldFields &&
        fieldSchema.map((field: any) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {renderSchemaField(field)}
          </div>
        ))}

      {/* New-style editable fields */}
      {hasNewFields &&
        editableFields.map((field: any) => (
          <div key={field.id}>
            <Label htmlFor={field.id}>
              {field.label}
              <span className="ml-2 text-xs text-muted-foreground capitalize">({field.type})</span>
            </Label>
            {renderEditableField(field)}
          </div>
        ))}

      {/* No fields message */}
      {!hasOldFields && !hasNewFields && (
        <p className="text-sm text-muted-foreground text-center py-4">This section has no editable fields.</p>
      )}

      {/* Preview toggle for AI-generated sections */}
      {template?.generated_html && (
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="mb-3">
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>

          {showPreview && (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>body { margin: 0; }</style>
                    </head>
                    <body>${renderPreviewHtml()}</body>
                  </html>
                `}
                className="w-full min-h-[200px] border-0"
                title="Section Preview"
              />
            </div>
          )}
        </div>
      )}

      <Button onClick={handleSave} disabled={isSaving} className="mt-4">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Section"
        )}
      </Button>

      <MediaLibraryModal
        open={mediaLibraryOpen}
        onClose={() => {
          setMediaLibraryOpen(false)
          setActiveImageField(null)
        }}
        onSelect={handleImageSelect}
      />
    </div>
  )
}
