"use client"

import dynamic from "next/dynamic"

const HeroOverlay = dynamic(() => import("./hero-overlay"))
const VisualTektonAbout1 = dynamic(() => import("./visual-tekton-about-1"))
const FullWidthVisualHeroDisplay1 = dynamic(() => import("./full-width-visual-hero-display-1"))
const FeaturesGrid = dynamic(() => import("./features-grid/features-grid"))
const PricingComparison = dynamic(() => import("./pricing-comparison/pricing-comparison"))
const CtaSection = dynamic(() => import("./cta-section/cta-section"))
const HeroCentered = dynamic(() => import("./hero-centered/hero-centered"))

const SECTION_COMPONENTS: Record<string, any> = {
  "sections/hero-overlay": HeroOverlay,
  "sections/visual-tekton-about-1": VisualTektonAbout1,
  "sections/full-width-visual-hero-display-1": FullWidthVisualHeroDisplay1,
  "sections/features-grid": FeaturesGrid,
  "sections/pricing-comparison": PricingComparison,
  "sections/cta-section": CtaSection,
  "sections/hero-centered": HeroCentered,
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
