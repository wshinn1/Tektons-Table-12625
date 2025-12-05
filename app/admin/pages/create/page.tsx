"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"
import { createPage } from "@/app/actions/pages"
import { useRouter } from "next/navigation"

export default function CreatePagePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const slug = formData.get("slug") as string
    const meta_description = formData.get("meta_description") as string

    try {
      const page = await createPage({
        title,
        slug,
        meta_description,
        is_published: false,
      })
      router.push(`/admin/pages/${page.slug}/edit`)
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
        <p className="text-gray-500 mt-1">Build a new page with modular sections</p>
      </div>

      <Card className="p-6">
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
              This will be the URL: yourdomain.com/
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
          After creating this page, you'll be able to add sections from the Section Gallery to build your page content.
        </p>
      </Card>
    </div>
  )
}
