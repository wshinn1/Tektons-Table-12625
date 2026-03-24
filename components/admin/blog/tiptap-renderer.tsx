"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { Iframe } from "./tiptap-iframe-extension"

interface TiptapRendererProps {
  content: string | object
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  let parsedContent
  try {
    if (typeof content === "string") {
      parsedContent = content ? JSON.parse(content) : ""
    } else {
      parsedContent = content
    }
  } catch (error) {
    console.error("[v0] Failed to parse TipTap content:", error)
    parsedContent = ""
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      } as any),
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Iframe.configure({
        allowFullscreen: true,
        HTMLAttributes: {
          class: "w-full rounded-md",
        },
      }),
    ],
    content: parsedContent,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none",
      },
    },
  })

  if (!isMounted || !editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
