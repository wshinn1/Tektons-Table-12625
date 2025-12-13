"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection(props: any) {
  const {
    headline = "Ready to get started?",
    subheadline = "",
    supportingText = "",
    ctaText = "Get Started",
    ctaLink = "/auth/signup",
    disclaimer = "",
    backgroundType = "gradient", // "solid", "gradient"
    backgroundColor = "bg-background",
    backgroundColorHex = "",
  } = props

  const displayDisclaimer = disclaimer || supportingText

  // Use hex color if backgroundType is "solid" or if backgroundColorHex is provided
  const shouldUseHexColor = backgroundType === "solid" || backgroundColorHex

  const backgroundStyle = shouldUseHexColor && backgroundColorHex ? { backgroundColor: backgroundColorHex } : undefined

  // Use Tailwind class only if no hex color is being used
  const backgroundClass = !shouldUseHexColor || !backgroundColorHex ? backgroundColor : ""

  return (
    <section className={`py-20 ${backgroundClass}`} style={backgroundStyle}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">{headline}</h2>
        {subheadline && <p className="text-xl text-muted-foreground mb-8 text-pretty">{subheadline}</p>}
        <Link
          href={ctaLink}
          className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-5 rounded-xl text-xl font-semibold hover:opacity-90 transition-opacity"
        >
          {ctaText}
          <ArrowRight className="w-6 h-6" />
        </Link>
        {displayDisclaimer && <p className="text-sm text-muted-foreground mt-4">{displayDisclaimer}</p>}
      </div>
    </section>
  )
}
