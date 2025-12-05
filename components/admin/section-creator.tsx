"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Wand2, Loader2, ImageIcon, Code, Eye, Check } from "lucide-react"
import { uploadScreenshot, createSectionTemplate } from "@/app/actions/sections"
import { useRouter } from "next/navigation"
import { SectionPreview } from "./section-preview"
import { SectionFieldEditor } from "./section-field-editor"

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

interface GeneratedSection {
  name: string
  category: string
  description: string
  editableFields: EditableField[]
  html: string
  suggestedColors?: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

export function SectionCreator() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload")
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [description, setDescription] = useState("")
  const [generatedSection, setGeneratedSection] = useState<GeneratedSection | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Manual creation state
  const [manualName, setManualName] = useState("")
  const [manualCategory, setManualCategory] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const [manualHtml, setManualHtml] = useState("")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const url = await uploadScreenshot(formData)
      setScreenshotUrl(url)
    } catch (err) {
      setError("Failed to upload screenshot")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  })

  const analyzeScreenshot = async () => {
    if (!screenshotUrl) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/screenshot-to-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotUrl, description }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze screenshot")
      }

      setGeneratedSection(data.section)

      // Initialize field values with defaults
      const initialValues: Record<string, string> = {}
      data.section.editableFields.forEach((field: EditableField) => {
        initialValues[field.id] = field.defaultValue
      })
      setFieldValues(initialValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze screenshot")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveSection = async () => {
    setIsSaving(true)
    setError(null)

    try {
      if (activeTab === "upload" && generatedSection) {
        await createSectionTemplate({
          name: generatedSection.name,
          category: generatedSection.category,
          description: generatedSection.description,
          source_type: "ai-generated",
          original_screenshot_url: screenshotUrl || undefined,
          editable_fields: generatedSection.editableFields,
          generated_html: generatedSection.html,
          default_props: fieldValues,
          thumbnail_url: screenshotUrl || undefined,
        })
      } else {
        await createSectionTemplate({
          name: manualName,
          category: manualCategory,
          description: manualDescription,
          source_type: "manual",
          generated_html: manualHtml,
          editable_fields: [],
          default_props: {},
        })
      }

      router.push("/admin/sections")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save section")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const renderPreviewHtml = () => {
    if (!generatedSection) return ""

    let html = generatedSection.html
    Object.entries(fieldValues).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return html
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "manual")}>
      <TabsList className="mb-6">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          AI from Screenshot
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Manual Creation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-6">
        {/* Step 1: Upload Screenshot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Upload Screenshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Uploading...</p>
                </div>
              ) : screenshotUrl ? (
                <div className="space-y-4">
                  <img
                    src={screenshotUrl || "/placeholder.svg"}
                    alt="Uploaded screenshot"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-muted-foreground">Click or drag to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">Drag & drop a screenshot here, or click to select</p>
                  <p className="text-xs text-muted-foreground">Supports PNG, JPG, JPEG, WebP</p>
                </div>
              )}
            </div>

            {screenshotUrl && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="description">Additional Context (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe any specific requirements or customizations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={analyzeScreenshot} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Screenshot...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Section with AI
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Edit Generated Section */}
        {generatedSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  2
                </span>
                Customize Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Fields Editor */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Editable Fields
                  </div>
                  <SectionFieldEditor
                    fields={generatedSection.editableFields}
                    values={fieldValues}
                    onChange={setFieldValues}
                  />
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </div>
                  <SectionPreview html={renderPreviewHtml()} />
                </div>
              </div>

              {/* Section Info */}
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Section Name</Label>
                    <Input
                      value={generatedSection.name}
                      onChange={(e) => setGeneratedSection({ ...generatedSection, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={generatedSection.category}
                      onValueChange={(v) => setGeneratedSection({ ...generatedSection, category: v })}
                    >
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
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={generatedSection.description}
                    onChange={(e) => setGeneratedSection({ ...generatedSection, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Save */}
        {generatedSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                  3
                </span>
                Save Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={saveSection} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save to Section Gallery
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="manual" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Section Manually</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-name">Section Name</Label>
                <Input
                  id="manual-name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Hero Section"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="manual-category">Category</Label>
                <Select value={manualCategory} onValueChange={setManualCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
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
            </div>

            <div>
              <Label htmlFor="manual-description">Description</Label>
              <Textarea
                id="manual-description"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="A brief description of this section..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="manual-html">HTML (with Tailwind CSS)</Label>
              <Textarea
                id="manual-html"
                value={manualHtml}
                onChange={(e) => setManualHtml(e.target.value)}
                placeholder="<section class='py-16 bg-white'>...</section>"
                className="mt-1 font-mono text-sm min-h-[300px]"
              />
            </div>

            <Button onClick={saveSection} disabled={isSaving || !manualName || !manualCategory} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Section
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">{error}</div>}
    </Tabs>
  )
}
