"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Section = {
  id: string
  section_key: string
  section_type: string
  title: string | null
  subtitle: string | null
  background_type: string
  background_value: string | null
  text_color: string | null
  content: any
  display_order: number
  is_active: boolean
}

export function HowItWorksEditorClient({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [saving, setSaving] = useState(false)
  const [draggedSection, setDraggedSection] = useState<Section | null>(null)
  const [blogCategories, setBlogCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("[v0] Fetching blog categories...")
        const response = await fetch("/api/admin/blog/categories")
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Blog categories response:", data)
          setBlogCategories(data.categories || [])
        } else {
          console.error("[v0] Failed to fetch categories, status:", response.status)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch blog categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/how-it-works-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast({ title: "Success", description: "How It Works sections updated successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to save sections", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (index: number, updates: Partial<Section>) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], ...updates }
    setSections(newSections)
  }

  const updateContent = (index: number, contentUpdates: any) => {
    const newSections = [...sections]
    newSections[index].content = { ...newSections[index].content, ...contentUpdates }
    setSections(newSections)
  }

  const updateStepField = (sectionIndex: number, stepIndex: number, field: string, value: any) => {
    const newSections = [...sections]
    const steps = [...newSections[sectionIndex].content.steps]
    steps[stepIndex] = { ...steps[stepIndex], [field]: value }
    newSections[sectionIndex].content = { ...newSections[sectionIndex].content, steps }
    setSections(newSections)
  }

  const updateStepDetails = (sectionIndex: number, stepIndex: number, details: string[]) => {
    const newSections = [...sections]
    const steps = [...newSections[sectionIndex].content.steps]
    steps[stepIndex] = { ...steps[stepIndex], details }
    newSections[sectionIndex].content = { ...newSections[sectionIndex].content, steps }
    setSections(newSections)
  }

  const updateFAQ = (sectionIndex: number, faqIndex: number, field: string, value: string) => {
    const newSections = [...sections]
    const faqs = [...newSections[sectionIndex].content.faqs]
    faqs[faqIndex] = { ...faqs[faqIndex], [field]: value }
    newSections[sectionIndex].content = { ...newSections[sectionIndex].content, faqs }
    setSections(newSections)
  }

  const addFAQ = (sectionIndex: number) => {
    const newSections = [...sections]
    const faqs = [...(newSections[sectionIndex].content.faqs || [])]
    faqs.push({ question: "New Question", answer: "New Answer" })
    newSections[sectionIndex].content = { ...newSections[sectionIndex].content, faqs }
    setSections(newSections)
  }

  const removeFAQ = (sectionIndex: number, faqIndex: number) => {
    const newSections = [...sections]
    const faqs = [...newSections[sectionIndex].content.faqs]
    faqs.splice(faqIndex, 1)
    newSections[sectionIndex].content = { ...newSections[sectionIndex].content, faqs }
    setSections(newSections)
  }

  const handleDragStart = (e: React.DragEvent, section: Section) => {
    setDraggedSection(section)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault()

    if (!draggedSection || draggedSection.id === targetSection.id) return

    const newSections = [...sections]
    const draggedIndex = newSections.findIndex((s) => s.id === draggedSection.id)
    const targetIndex = newSections.findIndex((s) => s.id === targetSection.id)

    newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedSection)

    const updatedSections = newSections.map((section, index) => ({
      ...section,
      display_order: index + 1,
    }))

    setSections(updatedSections)
    setDraggedSection(null)

    toast({
      title: "Reordered",
      description: "Section order updated. Don't forget to save!",
    })
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Drag and drop sections to reorder them. Changes will be saved when you click "Save All Changes".
      </p>

      {sections.map((section, index) => (
        <Card
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, section)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, section)}
          className="cursor-move hover:border-primary/50 transition-colors"
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
                <span>{section.section_key.replace(/_/g, " ").toUpperCase()}</span>
              </div>
              <span className="text-sm font-normal text-muted-foreground">Order: {section.display_order}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent/5 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Background Type</Label>
                  <Select
                    value={section.background_type}
                    onValueChange={(value) => updateSection(index, { background_type: value, background_value: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image URL</SelectItem>
                      <SelectItem value="video">Video CDN Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Solid Color Input */}
                {section.background_type === "color" && (
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.background_value || "#ffffff"}
                        onChange={(e) => updateSection(index, { background_value: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.background_value || "#ffffff"}
                        onChange={(e) => updateSection(index, { background_value: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Input */}
                {section.background_type === "gradient" && (
                  <div>
                    <Label>Gradient Classes (Tailwind)</Label>
                    <Input
                      value={section.background_value || ""}
                      onChange={(e) => updateSection(index, { background_value: e.target.value })}
                      placeholder="from-blue-500 to-purple-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use Tailwind gradient classes like "from-blue-500 to-purple-500"
                    </p>
                  </div>
                )}

                {/* Image URL Input */}
                {section.background_type === "image" && (
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={section.background_value || ""}
                      onChange={(e) => updateSection(index, { background_value: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter a full URL to an image (JPEG, PNG, WebP)</p>
                  </div>
                )}

                {/* Video CDN URL Input */}
                {section.background_type === "video" && (
                  <div>
                    <Label>Video CDN URL</Label>
                    <Input
                      value={section.background_value || ""}
                      onChange={(e) => updateSection(index, { background_value: e.target.value })}
                      placeholder="https://your-blob.vercel-storage.com/video.mp4"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste a Vercel Blob URL or external video link (.mp4, .webm)
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={section.text_color || "#000000"}
                      onChange={(e) => updateSection(index, { text_color: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
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
                      value={section.content?.subtitleColor || section.text_color || "#666666"}
                      onChange={(e) => updateContent(index, { subtitleColor: e.target.value })}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={section.content?.subtitleColor || section.text_color || "#666666"}
                      onChange={(e) => updateContent(index, { subtitleColor: e.target.value })}
                      placeholder="#666666"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Title and Subtitle */}
            {section.title !== null && (
              <div>
                <Label>Title</Label>
                <Input value={section.title || ""} onChange={(e) => updateSection(index, { title: e.target.value })} />
              </div>
            )}

            {section.subtitle !== null && (
              <div>
                <Label>Subtitle</Label>
                <Textarea
                  value={section.subtitle || ""}
                  onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  rows={2}
                />
              </div>
            )}

            {/* Hero Section Editor */}
            {section.section_type === "hero" && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label>Badge Text</Label>
                  <Input
                    value={section.content.badge || ""}
                    onChange={(e) => updateContent(index, { badge: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Highlighted Word (in title)</Label>
                    <Input
                      value={section.content.highlightedWord || ""}
                      onChange={(e) => updateContent(index, { highlightedWord: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Highlighted Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.content.highlightedColor || "#f5a390"}
                        onChange={(e) => updateContent(index, { highlightedColor: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.content.highlightedColor || "#f5a390"}
                        onChange={(e) => updateContent(index, { highlightedColor: e.target.value })}
                        placeholder="#f5a390"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.content.primaryButton?.bgColor || "#000000"}
                        onChange={(e) =>
                          updateContent(index, {
                            primaryButton: { ...section.content.primaryButton, bgColor: e.target.value },
                          })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.content.primaryButton?.bgColor || "#000000"}
                        onChange={(e) =>
                          updateContent(index, {
                            primaryButton: { ...section.content.primaryButton, bgColor: e.target.value },
                          })
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Primary Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.content.primaryButton?.textColor || "#ffffff"}
                        onChange={(e) =>
                          updateContent(index, {
                            primaryButton: { ...section.content.primaryButton, textColor: e.target.value },
                          })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={section.content.primaryButton?.textColor || "#ffffff"}
                        onChange={(e) =>
                          updateContent(index, {
                            primaryButton: { ...section.content.primaryButton, textColor: e.target.value },
                          })
                        }
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input
                      value={section.content.primaryButton?.text || ""}
                      onChange={(e) =>
                        updateContent(index, {
                          primaryButton: { ...section.content.primaryButton, text: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Primary Button URL</Label>
                    <Input
                      value={section.content.primaryButton?.url || ""}
                      onChange={(e) =>
                        updateContent(index, {
                          primaryButton: { ...section.content.primaryButton, url: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                {/* Secondary Button */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id={`show-secondary-${index}`}
                      checked={section.content.showSecondaryButton !== false}
                      onChange={(e) => updateContent(index, { showSecondaryButton: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`show-secondary-${index}`}>Show Secondary Button</Label>
                  </div>

                  {section.content.showSecondaryButton !== false && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Secondary Button Text</Label>
                        <Input
                          value={section.content.secondaryButton?.text || ""}
                          onChange={(e) =>
                            updateContent(index, {
                              secondaryButton: { ...section.content.secondaryButton, text: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Secondary Button URL</Label>
                        <Input
                          value={section.content.secondaryButton?.url || ""}
                          onChange={(e) =>
                            updateContent(index, {
                              secondaryButton: { ...section.content.secondaryButton, url: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Steps Timeline Editor */}
            {section.section_type === "steps_timeline" && (
              <div className="space-y-6 border-t pt-4">
                <div className="grid grid-cols-3 gap-4 bg-accent/5 p-4 rounded-lg">
                  <div>
                    <Label>Total Time Display</Label>
                    <Input
                      value={section.content.totalTime || ""}
                      onChange={(e) => updateContent(index, { totalTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Total Time Subtitle</Label>
                    <Input
                      value={section.content.totalTimeSubtitle || ""}
                      onChange={(e) => updateContent(index, { totalTimeSubtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Total Time Background</Label>
                    <Input
                      type="color"
                      value={section.content.totalTimeBg || "#ffe4dc"}
                      onChange={(e) => updateContent(index, { totalTimeBg: e.target.value })}
                    />
                  </div>
                </div>

                {section.content.steps?.map((step: any, stepIndex: number) => (
                  <Card key={stepIndex} className="bg-accent/5">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Step {step.number}: {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateStepField(index, stepIndex, "title", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <Input
                            value={step.time}
                            onChange={(e) => updateStepField(index, stepIndex, "time", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={step.description}
                          onChange={(e) => updateStepField(index, stepIndex, "description", e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Details (one per line)</Label>
                        <Textarea
                          value={step.details?.join("\n") || ""}
                          onChange={(e) => updateStepDetails(index, stepIndex, e.target.value.split("\n"))}
                          rows={4}
                          className="font-mono text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Video Section Editor */}
            {section.section_type === "video" && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Video Title</Label>
                    <Input
                      value={section.content.videoTitle || ""}
                      onChange={(e) => updateContent(index, { videoTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Video Subtitle</Label>
                    <Input
                      value={section.content.videoSubtitle || ""}
                      onChange={(e) => updateContent(index, { videoSubtitle: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Features Grid Editor */}
            {section.section_type === "features_grid" && (
              <div className="space-y-2 border-t pt-4">
                <Label>Features (one per line)</Label>
                <Textarea
                  value={section.content.features?.map((f: any) => f.text).join("\n") || ""}
                  onChange={(e) =>
                    updateContent(index, {
                      features: e.target.value
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((text) => ({ text, iconColor: "#f5a390" })),
                    })
                  }
                  rows={10}
                  className="font-mono"
                />
              </div>
            )}

            {/* FAQ Editor */}
            {section.section_type === "faq" && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>FAQs</Label>
                  <Button size="sm" variant="outline" onClick={() => addFAQ(index)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-4">
                  {section.content.faqs?.map((faq: any, faqIndex: number) => (
                    <Card key={faqIndex} className="bg-accent/5">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label>Question {faqIndex + 1}</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => updateFAQ(index, faqIndex, "question", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Answer</Label>
                              <Textarea
                                value={faq.answer}
                                onChange={(e) => updateFAQ(index, faqIndex, "answer", e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeFAQ(index, faqIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section Editor */}
            {section.section_type === "cta" && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={section.content.buttonText || ""}
                      onChange={(e) => updateContent(index, { buttonText: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Button URL</Label>
                    <Input
                      value={section.content.buttonUrl || ""}
                      onChange={(e) => updateContent(index, { buttonUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Color</Label>
                    <Input
                      type="color"
                      value={section.content.buttonColor || "#000000"}
                      onChange={(e) => updateContent(index, { buttonColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Supporting Text</Label>
                    <Input
                      value={section.content.supportingText || ""}
                      onChange={(e) => updateContent(index, { supportingText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Featured Blog Slider Editor */}
            {section.section_type === "featured_blog_slider" && (
              <div className="space-y-4 border-t pt-4">
                {console.log("[v0] Blog categories available:", blogCategories.length, blogCategories)}
                <div>
                  <Label htmlFor={`section-${index}-title`}>Title</Label>
                  <Input
                    id={`section-${index}-title`}
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, { title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor={`section-${index}-section-title`}>Section Title</Label>
                  <Input
                    id={`section-${index}-section-title`}
                    value={section.content?.sectionTitle || ""}
                    onChange={(e) => updateContent(index, { sectionTitle: e.target.value })}
                    placeholder="FEATURED POSTS"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The heading displayed at the top left of the slider
                  </p>
                </div>

                <div>
                  <Label>Selected Categories</Label>
                  {blogCategories.length === 0 && <p className="text-xs text-amber-600 mb-2">Loading categories...</p>}
                  <Select
                    value={
                      section.content?.selectedCategories && section.content.selectedCategories.length > 0
                        ? section.content.selectedCategories[0]
                        : ""
                    }
                    onValueChange={(value) => {
                      const currentCategories = section.content?.selectedCategories || []
                      const categoryIndex = currentCategories.indexOf(value)
                      if (categoryIndex > -1) {
                        // Remove if already selected
                        updateContent(index, {
                          selectedCategories: currentCategories.filter((c: string) => c !== value),
                        })
                      } else {
                        // Add if not selected
                        updateContent(index, {
                          selectedCategories: [...currentCategories, value],
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select categories">
                        {section.content?.selectedCategories && section.content.selectedCategories.length > 0
                          ? `${section.content.selectedCategories.length} categories selected`
                          : "Select categories"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      ) : (
                        blogCategories.map((cat) => {
                          const isSelected = section.content?.selectedCategories?.includes(cat.slug)
                          return (
                            <SelectItem key={cat.id} value={cat.slug}>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4" />
                                {cat.name}
                              </div>
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select one or more blog categories to display posts from
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`show-arrows-${index}`}
                    checked={section.content.showArrows !== false}
                    onChange={(e) => updateContent(index, { showArrows: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`show-arrows-${index}`}>Show navigation arrows</Label>
                </div>
              </div>
            )}

            {/* Active Toggle */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <input
                type="checkbox"
                id={`active-${section.id}`}
                checked={section.is_active}
                onChange={(e) => updateSection(index, { is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor={`active-${section.id}`} className="cursor-pointer">
                Section is active (visible on page)
              </Label>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-4 sticky bottom-4">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
