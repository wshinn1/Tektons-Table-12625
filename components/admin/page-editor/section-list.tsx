"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SectionEditor } from "./section-editor"
import { Button } from "@/components/ui/button"
import { deletePageSection, reorderPageSections } from "@/app/actions/pages"
import { useRouter } from "next/navigation"
import { Trash2, GripVertical, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SectionListProps {
  pageId: string
  sections: any[]
}

export function SectionList({ pageId, sections }: SectionListProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const handleDelete = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    setIsDeleting(sectionId)
    try {
      await deletePageSection(sectionId)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete section:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    await reorderSections(index, index - 1)
  }

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return
    await reorderSections(index, index + 1)
  }

  const reorderSections = async (fromIndex: number, toIndex: number) => {
    setIsReordering(true)
    try {
      const newSections = [...sections]
      const [moved] = newSections.splice(fromIndex, 1)
      newSections.splice(toIndex, 0, moved)

      const updates = newSections.map((section, i) => ({
        id: section.id,
        order_index: i,
      }))

      await reorderPageSections(updates)
      router.refresh()
    } catch (error) {
      console.error("Failed to reorder sections:", error)
    } finally {
      setIsReordering(false)
    }
  }

  const getSectionInfo = (section: any) => {
    if (section.source_type === "prismic") {
      const sliceName = section.prismic_slice_type?.replace(/([A-Z])/g, " $1")?.trim() || "Prismic Section"
      return {
        name: sliceName,
        category: "prismic",
        isPrismic: true,
      }
    }
    return {
      name: section.section_templates?.name || "Untitled Section",
      category: section.section_templates?.category || "",
      isPrismic: false,
    }
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>No sections added yet.</p>
        <p className="text-sm mt-1">Click "Add Section" to get started.</p>
      </div>
    )
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {sections.map((section, index) => {
        const sectionInfo = getSectionInfo(section)

        return (
          <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4 bg-card">
            <div className="flex items-center gap-2">
              <div className="flex flex-col -my-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || isReordering}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sections.length - 1 || isReordering}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <GripVertical className="h-4 w-4 text-muted-foreground" />

              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{sectionInfo.name}</span>
                    {sectionInfo.category && !sectionInfo.isPrismic && (
                      <span className="text-xs text-muted-foreground capitalize">{sectionInfo.category}</span>
                    )}
                    {sectionInfo.isPrismic && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Prismic
                      </Badge>
                    )}
                    {section.section_templates?.source_type === "ai-generated" && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(section.id)}
                disabled={isDeleting === section.id}
                className="text-muted-foreground hover:text-destructive"
              >
                {isDeleting === section.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            <AccordionContent>
              <SectionEditor section={section} isPrismic={sectionInfo.isPrismic} />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
