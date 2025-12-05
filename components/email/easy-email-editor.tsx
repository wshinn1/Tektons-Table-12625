"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Code } from "lucide-react"

interface EasyEmailEditorProps {
  initialHtml?: string
  initialDesign?: any
  onChange: (html: string, design: any) => void
}

export function EasyEmailEditor({ initialHtml = "", initialDesign, onChange }: EasyEmailEditorProps) {
  const [previewMode, setPreviewMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Load Easy Email dynamically
    const loadEditor = async () => {
      try {
        const { EmailEditor, EmailEditorProvider } = await import("easy-email-editor")
        const { BlockManager } = await import("easy-email-core")
        const { ExtensionProps, StandardLayout } = await import("easy-email-extensions")

        // Initialize editor with default template
        if (containerRef.current && !editorRef.current) {
          const defaultJson = initialDesign || {
            subject: "Newsletter",
            content: BlockManager.getBlockByType("Page").create({
              children: [
                BlockManager.getBlockByType("Section").create({
                  children: [
                    BlockManager.getBlockByType("Column").create({
                      children: [
                        BlockManager.getBlockByType("Text").create({
                          data: {
                            value: {
                              content: "<h1>Your Newsletter Title</h1><p>Write your newsletter content here.</p>",
                            },
                          },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }

          console.log("[v0] Easy Email editor initialized")

          editorRef.current = {
            json: defaultJson,
            html: initialHtml,
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load Easy Email:", error)
      }
    }

    loadEditor()
  }, [])

  const handleChange = (json: any, html: string) => {
    if (editorRef.current) {
      editorRef.current.json = json
      editorRef.current.html = html
      onChange(html, json)
    }
  }

  if (!mounted) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Loading email editor...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag and drop components to build your email</p>
        <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? (
            <>
              <Code className="h-4 w-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {previewMode ? (
          <div
            className="prose max-w-none min-h-[600px] p-4"
            dangerouslySetInnerHTML={{ __html: editorRef.current?.html || initialHtml }}
          />
        ) : (
          <div ref={containerRef} className="min-h-[600px] bg-white">
            {/* Easy Email Editor will render here */}
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">Visual email editor is loading...</p>
              <p className="text-sm">Drag and drop blocks to create your email layout.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
