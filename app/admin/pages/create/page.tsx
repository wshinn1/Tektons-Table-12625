"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"
import { createPage, createUnlayerPage } from "@/app/actions/pages"
import { useRouter } from "next/navigation"
import { Layers, Paintbrush, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const editorTypes = [
  {
    id: "unlayer",
    title: "Visual Page Builder",
    description:
      "Drag-and-drop editor with templates, images, and custom layouts. Best for landing pages and marketing content.",
    icon: Paintbrush,
    recommended: true,
  },
  {
    id: "sections",
    title: "Section Builder",
    description: "Build pages using pre-designed modular sections. Best for consistent, structured pages.",
    icon: Layers,
    recommended: false,
  },
]

export default function CreatePagePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [selectedEditor, setSelectedEditor] = useState<"sections" | "unlayer">("unlayer")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const meta_description = formData.get("meta_description") as string

    try {
      if (selectedEditor === "unlayer") {
        const page = await createUnlayerPage({
          title,
          slug,
          meta_description,
        })
        router.push(`/admin/pages/${page.slug}/builder`)
      } else {
        const page = await createPage({
          title,
          slug,
          meta_description,
          is_published: false,
        })
        router.push(`/admin/pages/${page.slug}/edit`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create page")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/pages" className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block">
          ← Back to Pages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Page</h1>
        <p className="text-gray-500 mt-1">Choose an editor and set up your new page</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Choose Editor Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editorTypes.map((editor) => {
            const Icon = editor.icon
            const isSelected = selectedEditor === editor.id
            return (
              <button
                key={editor.id}
                type="button"
                onClick={() => setSelectedEditor(editor.id as "sections" | "unlayer")}
                className={cn(
                  "relative p-6 rounded-lg border-2 text-left transition-all",
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white",
                )}
              >
                {editor.recommended && (
                  <span className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex items-start gap-4 mt-2">
                  <div className={cn("p-3 rounded-lg", isSelected ? "bg-blue-100" : "bg-gray-100")}>
                    <Icon className={cn("h-6 w-6", isSelected ? "text-blue-600" : "text-gray-600")} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("text-lg font-semibold", isSelected ? "text-blue-900" : "text-gray-900")}>
                      {editor.title}
                    </h3>
                    <p className={cn("text-sm mt-1", isSelected ? "text-blue-700" : "text-gray-500")}>
                      {editor.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Page Details</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" name="title" placeholder="About Us" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input id="slug" name="slug" placeholder="about-us" required />
            <p className="text-sm text-gray-500">
              This will be the URL: yourdomain.com/p/
              <span className="font-medium">slug</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              placeholder="Brief description for SEO and social sharing"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Page"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/pages">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">Next Steps</h2>
        <p className="text-sm text-gray-600">
          {selectedEditor === "unlayer"
            ? "After creating this page, you'll be taken to the Visual Page Builder where you can design your page with drag-and-drop tools, add images, text, buttons, and more."
            : "After creating this page, you'll be able to add sections from the Section Gallery to build your page content."}
        </p>
      </Card>
    </div>
  )
}
