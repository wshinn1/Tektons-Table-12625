"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface PricingSection {
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

interface PricingEditorClientProps {
  initialSections: PricingSection[]
}

export function PricingEditorClient({ initialSections }: PricingEditorClientProps) {
  const [sections, setSections] = useState<PricingSection[]>(initialSections)
  const [saving, setSaving] = useState(false)

  const updateSection = (index: number, updates: Partial<PricingSection>) => {
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
      const response = await fetch("/api/admin/pricing-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success("Pricing page updated successfully!")
    } catch (error) {
      toast.error("Failed to save changes")
      console.error(error)
    } finally {
      setSaving(false)
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

            {/* Background & Color Controls */}
            <div className="p-4 bg-muted rounded-lg space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Background Type</Label>
                  <Select
                    value={section.background_type || "gradient"}
                    onValueChange={(value) => updateSection(index, { background_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient Color</SelectItem>
                      <SelectItem value="image">Image URL</SelectItem>
                      <SelectItem value="video">Video CDN Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional background value input */}
                {section.background_type === "gradient" || !section.background_type ? (
                  <div className="col-span-2">
                    <Label>Background Color / Gradient</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.background_value?.startsWith("#") ? section.background_value : "#ffffff"}
                        onChange={(e) => updateSection(index, { background_value: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={section.background_value || ""}
                        onChange={(e) => updateSection(index, { background_value: e.target.value })}
                        placeholder="#ffffff or from-blue-500 to-purple-600"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Use hex color or Tailwind gradient classes</p>
                  </div>
                ) : section.background_type === "image" ? (
                  <div className="col-span-2">
                    <Label>Image URL</Label>
                    <Input
                      value={section.background_value || ""}
                      onChange={(e) => updateSection(index, { background_value: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter a direct URL to an image file</p>
                  </div>
                ) : section.background_type === "video" ? (
                  <div className="col-span-2">
                    <Label>Video CDN URL</Label>
                    <Input
                      value={section.background_value || ""}
                      onChange={(e) => updateSection(index, { background_value: e.target.value })}
                      placeholder="https://your-blob.vercel-storage.com/video.mp4"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste a Vercel Blob or CDN video URL (.mp4, .webm)
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Text color - only show for non-hero sections */}
              {section.section_type !== "hero" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.text_color || "#000000"}
                        onChange={(e) => updateSection(index, { text_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={section.text_color || ""}
                        onChange={(e) => updateSection(index, { text_color: e.target.value })}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hero Section */}
            {section.section_type === "hero" && (
              <>
                {/* Title and Subtitle Color Controls */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <Label>Title Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={section.text_color || "#000000"}
                        onChange={(e) => updateSection(index, { text_color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={section.text_color || ""}
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
                        onChange={(e) => updateContent(index, "subtitleColor", e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={section.content?.subtitleColor || ""}
                        onChange={(e) => updateContent(index, "subtitleColor", e.target.value)}
                        placeholder="#666666"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

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
                  <Label>Badge Text</Label>
                  <Input
                    value={section.content.badge || ""}
                    onChange={(e) => updateContent(index, "badge", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Highlighted Word</Label>
                  <Input
                    value={section.content.highlightedWord || ""}
                    onChange={(e) => updateContent(index, "highlightedWord", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Highlighted Color (Hex)</Label>
                  <Input
                    type="color"
                    value={section.content.highlightedColor || "#f5a390"}
                    onChange={(e) => updateContent(index, "highlightedColor", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Text</Label>
                    <Input
                      value={section.content.primaryButton?.text || ""}
                      onChange={(e) =>
                        updateContent(index, "primaryButton", {
                          ...section.content.primaryButton,
                          text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Primary Button URL</Label>
                    <Input
                      value={section.content.primaryButton?.url || ""}
                      onChange={(e) =>
                        updateContent(index, "primaryButton", { ...section.content.primaryButton, url: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Secondary Button Text</Label>
                    <Input
                      value={section.content.secondaryButton?.text || ""}
                      onChange={(e) =>
                        updateContent(index, "secondaryButton", {
                          ...section.content.secondaryButton,
                          text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Secondary Button URL</Label>
                    <Input
                      value={section.content.secondaryButton?.url || ""}
                      onChange={(e) =>
                        updateContent(index, "secondaryButton", {
                          ...section.content.secondaryButton,
                          url: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Payment Flow Section */}
            {section.section_type === "payment_flow" && (
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
                {section.content.steps?.map((step: any, stepIndex: number) => (
                  <div key={stepIndex} className="border-l-4 border-accent pl-4 space-y-2">
                    <h4 className="font-semibold">Step {step.number}</h4>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={step.title || ""}
                        onChange={(e) => {
                          const newSteps = [...section.content.steps]
                          newSteps[stepIndex].title = e.target.value
                          updateContent(index, "steps", newSteps)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={step.description || ""}
                        onChange={(e) => {
                          const newSteps = [...section.content.steps]
                          newSteps[stepIndex].description = e.target.value
                          updateContent(index, "steps", newSteps)
                        }}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Security Features Section */}
            {section.section_type === "security_features" && (
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
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  />
                </div>
                {section.content.features?.map((feature: any, featureIndex: number) => (
                  <div key={featureIndex} className="border-l-4 border-accent pl-4 space-y-2">
                    <h4 className="font-semibold">Feature {featureIndex + 1}</h4>
                    <div>
                      <Label>Icon (credit-card, lock, shield, database, eye, check-circle)</Label>
                      <Input
                        value={feature.icon || ""}
                        onChange={(e) => {
                          const newFeatures = [...section.content.features]
                          newFeatures[featureIndex].icon = e.target.value
                          updateContent(index, "features", newFeatures)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={feature.title || ""}
                        onChange={(e) => {
                          const newFeatures = [...section.content.features]
                          newFeatures[featureIndex].title = e.target.value
                          updateContent(index, "features", newFeatures)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={feature.description || ""}
                        onChange={(e) => {
                          const newFeatures = [...section.content.features]
                          newFeatures[featureIndex].description = e.target.value
                          updateContent(index, "features", newFeatures)
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Stripe Integration Section */}
            {section.section_type === "stripe_integration" && (
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
                  <Label>Badge Text</Label>
                  <Input
                    value={section.content.badge || ""}
                    onChange={(e) => updateContent(index, "badge", e.target.value)}
                  />
                </div>
                <div className="border-l-4 border-accent pl-4 space-y-2">
                  <h4 className="font-semibold">Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Processed Amount</Label>
                      <Input
                        value={section.content.stats?.processed || ""}
                        onChange={(e) =>
                          updateContent(index, "stats", { ...section.content.stats, processed: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Processed Label</Label>
                      <Input
                        value={section.content.stats?.processedLabel || ""}
                        onChange={(e) =>
                          updateContent(index, "stats", { ...section.content.stats, processedLabel: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Countries Count</Label>
                      <Input
                        value={section.content.stats?.countries || ""}
                        onChange={(e) =>
                          updateContent(index, "stats", { ...section.content.stats, countries: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Countries Label</Label>
                      <Input
                        value={section.content.stats?.countriesLabel || ""}
                        onChange={(e) =>
                          updateContent(index, "stats", { ...section.content.stats, countriesLabel: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Certifications Section */}
            {section.section_type === "certifications" && (
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
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  />
                </div>
                {section.content.certifications?.map((cert: any, certIndex: number) => (
                  <div key={certIndex} className="border-l-4 border-accent pl-4 space-y-2">
                    <h4 className="font-semibold">Certification {certIndex + 1}</h4>
                    <div>
                      <Label>Icon</Label>
                      <Input
                        value={cert.icon || ""}
                        onChange={(e) => {
                          const newCerts = [...section.content.certifications]
                          newCerts[certIndex].icon = e.target.value
                          updateContent(index, "certifications", newCerts)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={cert.title || ""}
                        onChange={(e) => {
                          const newCerts = [...section.content.certifications]
                          newCerts[certIndex].title = e.target.value
                          updateContent(index, "certifications", newCerts)
                        }}
                      />
                    </div>
                    <div>
                      <Label>Subtitle</Label>
                      <Input
                        value={cert.subtitle || ""}
                        onChange={(e) => {
                          const newCerts = [...section.content.certifications]
                          newCerts[certIndex].subtitle = e.target.value
                          updateContent(index, "certifications", newCerts)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Data Control Section */}
            {section.section_type === "data_control" && (
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
                  <Input
                    value={section.subtitle || ""}
                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">What We Collect - Items (comma separated)</Label>
                    <Textarea
                      value={section.content.collect?.items?.join(", ") || ""}
                      onChange={(e) =>
                        updateContent(index, "collect", {
                          ...section.content.collect,
                          items: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">What We Don't Collect - Items (comma separated)</Label>
                    <Textarea
                      value={section.content.dontCollect?.items?.join(", ") || ""}
                      onChange={(e) =>
                        updateContent(index, "dontCollect", {
                          ...section.content.dontCollect,
                          items: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      rows={3}
                    />
                  </div>
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
                  <Label>Button Color (Hex)</Label>
                  <Input
                    type="color"
                    value={section.content.buttonColor || "#1e293b"}
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

      <div className="sticky bottom-0 bg-card border-t p-4 flex justify-end gap-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
