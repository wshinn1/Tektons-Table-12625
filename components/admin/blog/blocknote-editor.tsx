"use client"

import { useEffect, useState } from "react"
import type { PartialBlock } from "@blocknote/core"
import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"

interface BlockNoteEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  placeholder?: string
}

export function BlockNoteEditorComponent({
  initialContent,
  onChange,
  placeholder = "Start writing your blog post...",
}: BlockNoteEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Parse initial content
  const getInitialBlocks = (): PartialBlock[] | undefined => {
    if (!initialContent) return undefined

    try {
      return JSON.parse(initialContent) as PartialBlock[]
    } catch (error) {
      console.error("[v0] Error parsing initial content:", error)
      return undefined
    }
  }

  const editor = useCreateBlockNote({
    initialContent: getInitialBlocks(),
    uploadFile: async (file: File) => {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const result = await response.json()
        return result.url
      } catch (error) {
        console.error("[v0] Image upload error:", error)
        throw error
      }
    },
  })

  useEffect(() => {
    if (!editor || !initialContent) return

    try {
      const blocks = JSON.parse(initialContent) as PartialBlock[]

      // Only update if content is different to avoid infinite loops
      const currentContent = JSON.stringify(editor.document)
      if (currentContent !== initialContent) {
        editor.replaceBlocks(editor.document, blocks)
      }
    } catch (error) {
      console.error("[v0] Error updating editor content:", error)
    }
  }, [editor, initialContent])

  // Handle content changes
  useEffect(() => {
    if (!editor) return

    const handleChange = async () => {
      const blocks = editor.document
      onChange(JSON.stringify(blocks))
    }

    // Listen to editor changes
    editor.onChange(handleChange)
  }, [editor, onChange])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="border rounded-lg p-4 bg-background min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background min-h-[400px]">
      <BlockNoteView editor={editor} theme="light" formattingToolbar={true} />
    </div>
  )
}

export { BlockNoteEditorComponent as BlogBlockNoteEditor }
