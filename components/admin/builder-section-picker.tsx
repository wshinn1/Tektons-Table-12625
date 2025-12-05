"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Layout, Sparkles, Mail, ShoppingCart, ImageIcon, FileText } from "lucide-react"

const BUILDER_SECTIONS = [
  // Hero Sections
  {
    id: "hero-with-image",
    name: "Hero with Image",
    category: "Hero",
    icon: Layout,
    description: "Full-width hero with background image and CTA",
  },
  {
    id: "hero-split",
    name: "Hero Split",
    category: "Hero",
    icon: Layout,
    description: "Two-column hero with image and content",
  },
  {
    id: "hero-video",
    name: "Hero with Video",
    category: "Hero",
    icon: Layout,
    description: "Hero section with video background",
  },
  { id: "hero-minimal", name: "Minimal Hero", category: "Hero", icon: Layout, description: "Clean, text-focused hero" },

  // Content Sections
  {
    id: "features-grid",
    name: "Features Grid",
    category: "Content",
    icon: Layout,
    description: "Grid layout showcasing features",
  },
  {
    id: "testimonials",
    name: "Testimonials",
    category: "Content",
    icon: Sparkles,
    description: "Customer testimonials carousel",
  },
  {
    id: "stats",
    name: "Stats Section",
    category: "Content",
    icon: FileText,
    description: "Display key metrics and numbers",
  },
  {
    id: "team-members",
    name: "Team Members",
    category: "Content",
    icon: Layout,
    description: "Team member cards with photos",
  },
  {
    id: "pricing",
    name: "Pricing Tables",
    category: "Content",
    icon: ShoppingCart,
    description: "Pricing comparison tables",
  },
  { id: "faq", name: "FAQ Accordion", category: "Content", icon: FileText, description: "Frequently asked questions" },
  {
    id: "content-image",
    name: "Content with Image",
    category: "Content",
    icon: ImageIcon,
    description: "Text content with side image",
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "Content",
    icon: Layout,
    description: "Vertical timeline with milestones",
  },
  {
    id: "logo-cloud",
    name: "Logo Cloud",
    category: "Content",
    icon: Layout,
    description: "Display partner/client logos",
  },

  // CTA Sections
  { id: "cta-banner", name: "CTA Banner", category: "CTA", icon: Sparkles, description: "Call-to-action banner" },
  { id: "cta-split", name: "CTA with Image", category: "CTA", icon: Sparkles, description: "CTA section with image" },
  { id: "newsletter", name: "Newsletter Signup", category: "CTA", icon: Mail, description: "Email subscription form" },
  { id: "contact-form", name: "Contact Form", category: "CTA", icon: Mail, description: "Full contact form" },
]

interface BuilderSectionPickerProps {
  onSelect: (section: { id: string; name: string; category: string }) => void
  onCancel?: () => void
}

export function BuilderSectionPicker({ onSelect, onCancel }: BuilderSectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = ["all", ...new Set(BUILDER_SECTIONS.map((s) => s.category))]

  const filteredSections = BUILDER_SECTIONS.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || section.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const groupedSections = filteredSections.reduce(
    (acc, section) => {
      if (!acc[section.category]) {
        acc[section.category] = []
      }
      acc[section.category].push(section)
      return acc
    },
    {} as Record<string, typeof BUILDER_SECTIONS>,
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Builder.io sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(groupedSections).map(([category, sections]) => (
          <div key={category} className="col-span-full">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <Card
                    key={section.id}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onSelect({ id: section.id, name: section.name, category: section.category })}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{section.name}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {onCancel && (
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
