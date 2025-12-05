"use client"

import { BuilderSectionRenderer } from "@/components/builder/builder-section-renderer"

interface PageSectionRendererProps {
  sections: any[]
}

/**
 * Universal section renderer that handles both built-in and Builder.io sections
 * Can be used on any page in the application
 */
export function PageSectionRenderer({ sections }: PageSectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <>
      {sections.map((section, index) => {
        if (section.source_type === "builder_io" && section.builder_section_id) {
          return <BuilderSectionRenderer key={section.id || index} content={section.content} />
        }

        // Built-in section - render based on section_type
        // This would be handled by your existing section rendering logic
        return null // Placeholder - your existing section components would go here
      })}
    </>
  )
}
