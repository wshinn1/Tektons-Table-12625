"use client"

import type React from "react"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import Youtube from "@tiptap/extension-youtube"
import { Iframe } from "./tiptap-iframe-extension"
import { useEffect, useState, useRef } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  Video,
  Loader2,
  Frame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { MediaLibraryModal } from "@/components/admin/media-library-modal"
import { IframeEmbedDialog } from "./iframe-embed-dialog"
import { toast } from "sonner"

interface TiptapEditorProps {
  initialContent?: string
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string | null>
}

export function TiptapEditor({ initialContent, content, onChange, placeholder, onImageUpload }: TiptapEditorProps) {
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showIframeDialog, setShowIframeDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startingContent = initialContent || content || ""
  const [isMounted, setIsMounted] = useState(false)

  // Safely parse content, handling edge cases
  const parseContent = (rawContent: string | undefined | null): any => {
    if (!rawContent || rawContent === "" || rawContent === "[]") {
      return ""
    }
    try {
      if (typeof rawContent === "string" && (rawContent.startsWith("{") || rawContent.startsWith("["))) {
        return JSON.parse(rawContent)
      }
      return rawContent
    } catch (e) {
      console.error("[v0] Failed to parse content:", e)
      return rawContent
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!onImageUpload) {
      toast.error("Image upload not available")
      return null
    }

    setIsUploading(true)
    try {
      const url = await onImageUpload(file)
      if (url && url.startsWith("blob:")) {
        console.error("Upload returned blob URL instead of real URL")
        toast.error("Image upload failed - please try again")
        return null
      }
      return url
    } catch (error) {
      console.error("Image upload failed:", error)
      toast.error("Failed to upload image")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageFiles = async (files: FileList | File[], editor: any) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const url = await uploadImage(file)
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      }
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: true,
        link: false,
        underline: false, // Explicitly disable underline in StarterKit to avoid duplicate extension warning
      }),
      Underline,
      Link.configure({
        openOnClick: false,
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
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
    ],
    content: parseContent(startingContent),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] max-w-none p-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = event.dataTransfer.files
          const hasImages = Array.from(files).some((file) => file.type.startsWith("image/"))

          if (hasImages && onImageUpload) {
            event.preventDefault()
            // Use setTimeout to ensure editor is available
            setTimeout(() => {
              if (editor) {
                handleImageFiles(files, editor)
              }
            }, 0)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items
        if (items && onImageUpload) {
          const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"))

          if (imageItems.length > 0) {
            event.preventDefault()
            const files = imageItems.map((item) => item.getAsFile()).filter((f): f is File => f !== null)

            setTimeout(() => {
              if (editor && files.length > 0) {
                handleImageFiles(files, editor)
              }
            }, 0)
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()

      const sanitizedJson = sanitizeBlobUrls(json)
      onChange?.(JSON.stringify(sanitizedJson))
    },
  })

  const sanitizeBlobUrls = (node: any): any => {
    if (!node) return node

    if (node.type === "image" && node.attrs?.src?.startsWith("blob:")) {
      // Replace blob URL images with a placeholder or remove them
      return {
        type: "paragraph",
        content: [{ type: "text", text: "[Image failed to upload - please re-add]" }],
      }
    }

    if (node.content && Array.isArray(node.content)) {
      return {
        ...node,
        content: node.content.map(sanitizeBlobUrls).filter(Boolean),
      }
    }

    return node
  }

  useEffect(() => {
    const contentToUse = initialContent || content
    if (editor && contentToUse && contentToUse !== "" && contentToUse !== "[]") {
      const parsedContent = parseContent(contentToUse)
      if (parsedContent) {
        editor.commands.setContent(parsedContent)
      }
    }
  }, [editor, initialContent, content])

  // Don't render until mounted to prevent hydration issues
  if (!isMounted || !editor) {
    return (
      <div className="border rounded-lg p-4 bg-background min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  const addLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    if (onImageUpload) {
      fileInputRef.current?.click()
    } else {
      setShowMediaModal(true)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = await uploadImage(file)
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleMediaSelect = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run()
    setShowMediaModal(false)
  }

  const addYouTube = () => {
    const url = window.prompt("Enter YouTube URL")
    if (url) {
      editor.commands.setYoutubeVideo({ src: url })
    }
  }

  const addIframe = () => {
    setShowIframeDialog(true)
  }

  const handleIframeEmbed = (src: string, width: string, height: string) => {
    console.log("[v0] Embedding iframe:", { src, width, height })

    if (!editor) {
      console.error("[v0] Editor not available")
      toast.error("Editor not ready")
      return
    }

    editor.commands.setIframe({
      src,
      width: width || "100%",
      height: height || "640",
    })

    toast.success("Iframe embedded successfully")
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
          {/* Text Formatting */}
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6" />

          {/* Link, Image & Media */}
          <Button size="sm" variant="ghost" onClick={addLink} className="h-8 px-2" title="Add Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={addImage}
            className="h-8 px-2"
            title="Add Image"
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={addYouTube} className="h-8 px-2" title="Embed YouTube Video">
            <Video className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={addIframe}
            className="h-8 px-2"
            title="Embed Iframe (Scribehow, Loom, etc.)"
          >
            <Frame className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 px-2"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 px-2"
          >
            <Redo className="h-4 w-4" />
          </Button>

          {isUploading && (
            <span className="ml-2 text-sm text-muted-foreground flex items-center">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Uploading...
            </span>
          )}
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

      <MediaLibraryModal open={showMediaModal} onClose={() => setShowMediaModal(false)} onSelect={handleMediaSelect} />

      {/* Iframe Embed Dialog */}
      <IframeEmbedDialog
        open={showIframeDialog}
        onClose={() => setShowIframeDialog(false)}
        onEmbed={handleIframeEmbed}
      />
    </>
  )
}

// Export alias for compatibility
export const BlogTiptapEditor = TiptapEditor
