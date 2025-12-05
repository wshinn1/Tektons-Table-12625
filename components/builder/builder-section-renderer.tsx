"use client"

import { BuilderComponent } from "@builder.io/react"

interface BuilderSectionRendererProps {
  content: any
  model?: string
}

export function BuilderSectionRenderer({ content, model = "section" }: BuilderSectionRendererProps) {
  if (!content) {
    return null
  }

  return <BuilderComponent model={model} content={content} />
}
