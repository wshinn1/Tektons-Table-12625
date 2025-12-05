"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { addSectionToPage } from "@/app/actions/pages"
import { useRouter } from "next/navigation"
import { Plus, Search, X, Loader2, Wand2, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { BuilderSectionPicker } from "@/components/admin/builder-section-picker"

interface SectionSelectorProps {
  pageId: string
  templates: any[]
  sectionsCount: number
}

export function SectionSelector({ pageId, templates, sectionsCount }: SectionSelectorProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [sourceTab, setSourceTab] = useState<"built-in" | "builder_io">("built-in")

  // Group templates by category
  const categories = ["all", ...new Set(templates.map((t) => t.category))]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || template.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleAddSection = async (templateId: string) => {
    setIsAdding(templateId)
    try {
      await addSectionToPage(pageId, templateId, sectionsCount)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to add section:", error)
    } finally {
      setIsAdding(null)
    }
  }

  const handleAddBuilderSection = async (section: { id: string; name: string; category: string }) => {
    setIsAdding(section.id)
    try {
      const response = await fetch("/api/admin/page-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_id: pageId,
          source_type: "builder_io",
          builder_section_id: section.id,
          content: {},
          order_index: sectionsCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add Builder.io section")
      }

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to add Builder.io section:", error)
    } finally {
      setIsAdding(null)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Section
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-5xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold">Add Section</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a section from templates or Builder.io</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs
          value={sourceTab}
          onValueChange={(v) => setSourceTab(v as "built-in" | "builder_io")}
          className="flex-1 flex flex-col"
        >
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="built-in">Built-in Templates</TabsTrigger>
              <TabsTrigger value="builder_io">Builder.io Sections</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="built-in" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
            <div className="p-4 border-b space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="flex-wrap h-auto gap-1">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="capitalize">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-3 mb-6">
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/admin/sections/create" target="_blank">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create from Screenshot
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/admin/sections" target="_blank">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Manage Gallery
                  </Link>
                </Button>
              </div>

              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary/50 ${
                        isAdding === template.id ? "opacity-50" : ""
                      }`}
                      onClick={() => !isAdding && handleAddSection(template.id)}
                    >
                      <div className="aspect-video bg-muted relative">
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url || "/placeholder.svg"}
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <LayoutGrid className="h-8 w-8" />
                          </div>
                        )}
                        {isAdding === template.id && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        )}
                        {template.source_type === "ai-generated" && (
                          <span className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold truncate">{template.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-1">{template.category}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{template.description}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "No sections found matching your search" : "No sections in this category"}
                  </p>
                  <Button asChild>
                    <Link href="/admin/sections/create">Create New Section</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="builder_io" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
            <div className="p-6">
              <BuilderSectionPicker onSelect={handleAddBuilderSection} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
