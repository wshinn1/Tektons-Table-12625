"use client"

import dynamic from "next/dynamic"

// Dynamically import section components
const HeroOverlay = dynamic(() => import("./hero-overlay"))
const VisualTektonAbout1 = dynamic(() => import("./visual-tekton-about-1"))

const SECTION_COMPONENTS: Record<string, any> = {
  "sections/hero-overlay": HeroOverlay,
  "sections/visual-tekton-about-1": VisualTektonAbout1,
  // Add more section components as they are created
}

interface SectionRendererProps {
  template: {
    component_path: string
    name: string
  }
  props: Record<string, any>
  isVisible: boolean
}

export function SectionRenderer({ template, props, isVisible }: SectionRendererProps) {
  if (!isVisible) return null

  const Component = SECTION_COMPONENTS[template.component_path]

  if (!Component) {
    console.warn(`Section component not found: ${template.component_path}`)
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-8 text-center">
        <p className="text-yellow-800">Section "{template.name}" is not yet implemented</p>
        <p className="text-sm text-yellow-600 mt-2">Component path: {template.component_path}</p>
      </div>
    )
  }

  return <Component {...props} />
}
