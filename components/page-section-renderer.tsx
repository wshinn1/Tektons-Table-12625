"use client"

interface PageSectionRendererProps {
  sections: any[]
}

export function PageSectionRenderer({ sections }: PageSectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <>
      {sections.map((section, index) => {
        // Render screenshot section
        if (section.source_type === "screenshot" && section.content?.code) {
          return (
            <div key={section.id || index} className="w-full">
              <div dangerouslySetInnerHTML={{ __html: section.content.code }} />
            </div>
          )
        }

        // Built-in sections would be rendered here based on section_type
        // Currently only screenshot sections are supported in this renderer
        return null
      })}
    </>
  )
}
