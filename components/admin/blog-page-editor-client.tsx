"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Save, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BlogPageSection {
  id: string
  section_key: string
  section_type: string
  title: string | null
  subtitle: string | null
  content: any
  display_order: number
  is_active: boolean
}

interface BlogPost {
  id: string
  title: string
  slug: string
}

interface Props {
  sections: BlogPageSection[]
  posts: BlogPost[]
}

export function BlogPageEditorClient({ sections: initialSections, posts }: Props) {
  const [sections, setSections] = useState<BlogPageSection[]>(initialSections)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

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
      return newSections.map((s, i) => ({ ...s, display_order: i }))
    })
  }

  const updateSection = (id: string, updates: Partial<BlogPageSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const updateSectionContent = (id: string, contentUpdates: Record<string, any>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...contentUpdates } } : s)))
  }

  const toggleHeroPost = (sectionId: string, postId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const currentIds: string[] = section.content?.selectedPostIds || []
    let newIds: string[]

    if (currentIds.includes(postId)) {
      newIds = currentIds.filter((id) => id !== postId)
    } else if (currentIds.length < 4) {
      newIds = [...currentIds, postId]
    } else {
      toast.error("Maximum 4 posts can be selected for the hero slider")
      return
    }

    updateSectionContent(sectionId, { selectedPostIds: newIds })
  }

  const removeHeroPost = (sectionId: string, postId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const currentIds: string[] = section.content?.selectedPostIds || []
    updateSectionContent(sectionId, { selectedPostIds: currentIds.filter((id) => id !== postId) })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/blog-page-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      })

      if (!res.ok) throw new Error("Failed to save")
      toast.success("Blog page sections saved successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save sections")
    } finally {
      setSaving(false)
    }
  }

  const getSectionLabel = (type: string) => {
    switch (type) {
      case "blog_hero_slider":
        return "Hero Slider"
      case "blog_featured_post":
        return "Featured Post"
      case "blog_masonry":
        return "Masonry Grid"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Page Editor</h1>
          <p className="text-muted-foreground">Customize the platform blog page sections</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-4">
        {sections
          .sort((a, b) => a.display_order - b.display_order)
          .map((section, index) => (
            <Card key={section.id} className="overflow-hidden">
              {/* Section Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{getSectionLabel(section.section_type)}</h3>
                    <p className="text-sm text-muted-foreground">{section.section_key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
                    <Label htmlFor={`active-${section.id}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${section.id}`}
                      checked={section.is_active}
                      onCheckedChange={(checked) => updateSection(section.id, { is_active: checked })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveSection(index, "up")
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveSection(index, "down")
                    }}
                    disabled={index === sections.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div className="p-6 border-t space-y-6">
                  {/* Hero Slider Settings */}
                  {section.section_type === "blog_hero_slider" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Tagline</Label>
                        <Input
                          value={section.content?.tagline || ""}
                          onChange={(e) => updateSectionContent(section.id, { tagline: e.target.value })}
                          placeholder="TEKTON'S TABLE, personal editorial daily magazine."
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          The main text displayed over the hero image
                        </p>
                      </div>
                      <div>
                        <Label>Highlight Word</Label>
                        <Input
                          value={section.content?.highlightWord || ""}
                          onChange={(e) => updateSectionContent(section.id, { highlightWord: e.target.value })}
                          placeholder="editorial"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This word will be circled/highlighted in the tagline
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <Label>Post Selection Mode</Label>
                        <Select
                          value={section.content?.mode || "auto"}
                          onValueChange={(value) => updateSectionContent(section.id, { mode: value })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Automatic (4 Most Recent Posts)</SelectItem>
                            <SelectItem value="manual">Manual Selection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {section.content?.mode === "manual" && (
                        <div className="space-y-3">
                          <Label>Selected Posts ({(section.content?.selectedPostIds || []).length}/4)</Label>

                          {/* Show selected posts */}
                          {(section.content?.selectedPostIds || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(section.content?.selectedPostIds || []).map((postId: string) => {
                                const post = posts.find((p) => p.id === postId)
                                if (!post) return null
                                return (
                                  <div
                                    key={postId}
                                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm"
                                  >
                                    <span className="max-w-[200px] truncate">{post.title}</span>
                                    <button
                                      onClick={() => removeHeroPost(section.id, postId)}
                                      className="hover:bg-primary/20 rounded-full p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Post selector */}
                          <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                            {posts.map((post) => {
                              const isSelected = (section.content?.selectedPostIds || []).includes(post.id)
                              return (
                                <div
                                  key={post.id}
                                  className={`flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer ${isSelected ? "bg-primary/5" : ""}`}
                                  onClick={() => toggleHeroPost(section.id, post.id)}
                                >
                                  <Checkbox checked={isSelected} />
                                  <span className="text-sm truncate">{post.title}</span>
                                </div>
                              )
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Select up to 4 posts to display in the hero slider. If fewer than 4 are selected, recent
                            posts will fill the remaining slots.
                          </p>
                        </div>
                      )}

                      {section.content?.mode !== "manual" && (
                        <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                          This section automatically displays the 4 most recent blog posts. The featured image changes
                          on hover.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Featured Post Settings */}
                  {section.section_type === "blog_featured_post" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Select Featured Post</Label>
                        <Select
                          value={section.content?.featuredPostId || "auto"}
                          onValueChange={(value) =>
                            updateSectionContent(section.id, {
                              featuredPostId: value === "auto" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a post" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Most Recent)</SelectItem>
                            {posts.map((post) => (
                              <SelectItem key={post.id} value={post.id}>
                                {post.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose a specific post to feature, or let it auto-select the most recent
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Masonry Grid Settings */}
                  {section.section_type === "blog_masonry" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Columns</Label>
                          <Select
                            value={String(section.content?.columns || 2)}
                            onValueChange={(value) =>
                              updateSectionContent(section.id, { columns: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Columns</SelectItem>
                              <SelectItem value="3">3 Columns</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Rows</Label>
                          <Select
                            value={String(section.content?.rows || 2)}
                            onValueChange={(value) =>
                              updateSectionContent(section.id, { rows: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Rows</SelectItem>
                              <SelectItem value="3">3 Rows</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Grid will show {(section.content?.columns || 2) * (section.content?.rows || 2)} posts total (
                        {section.content?.columns || 2} columns x {section.content?.rows || 2} rows)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
      </div>
    </div>
  )
}
