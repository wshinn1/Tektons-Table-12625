"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Tablet } from "lucide-react"

interface SectionPreviewProps {
  html: string
}

type ViewportSize = "desktop" | "tablet" | "mobile"

export function SectionPreview({ html }: SectionPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop")

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  }

  return (
    <div className="space-y-3">
      {/* Viewport Selector */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={viewport === "desktop" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("desktop")}
          className="flex-1"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "tablet" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("tablet")}
          className="flex-1"
        >
          <Tablet className="h-4 w-4" />
        </Button>
        <Button
          variant={viewport === "mobile" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewport("mobile")}
          className="flex-1"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Frame */}
      <div
        className="bg-white rounded-lg border overflow-hidden transition-all duration-300 mx-auto"
        style={{ width: viewportWidths[viewport], maxWidth: "100%" }}
      >
        <div className="overflow-auto max-h-[500px]">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    body { margin: 0; }
                  </style>
                </head>
                <body>
                  ${html}
                </body>
              </html>
            `}
            className="w-full min-h-[300px] border-0"
            title="Section Preview"
          />
        </div>
      </div>
    </div>
  )
}
