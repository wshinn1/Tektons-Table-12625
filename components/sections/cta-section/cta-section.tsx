"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTASection({ props }: { props: any }) {
  const {
    headline,
    subheadline,
    ctaText = "Get Started",
    ctaLink = "/auth/signup",
    disclaimer,
    backgroundColor = "bg-background",
  } = props

  return (
    <section className={`py-20 ${backgroundColor}`}>
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
        {disclaimer && <p className="text-sm text-muted-foreground mt-4">{disclaimer}</p>}
      </div>
    </section>
  )
}
