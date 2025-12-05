"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { SectionList } from "./section-list"
import { SectionSelector } from "./section-selector"
import { updatePage, setAsHomepage } from "@/app/actions/pages"
import { useRouter } from "next/navigation"

interface PageEditorProps {
  page: any
  sections: any[]
  templates: any[]
}

export function PageEditor({ page, sections, templates }: PageEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(page.title)
  const [metaDescription, setMetaDescription] = useState(page.meta_description || "")
  const [isPublished, setIsPublished] = useState(page.is_published)
  const [isSaving, setIsSaving] = useState(false)
  const [isSettingHomepage, setIsSettingHomepage] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePage(page.id, {
        title,
        meta_description: metaDescription,
        is_published: isPublished,
      })
      router.refresh()
    } catch (error) {
      console.error("Failed to save page:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetAsHomepage = async () => {
    if (confirm("Are you sure you want to set this page as the homepage? This will replace the current homepage.")) {
      setIsSettingHomepage(true)
      try {
        await setAsHomepage(page.id)
        router.refresh()
      } catch (error) {
        console.error("Failed to set as homepage:", error)
      } finally {
        setIsSettingHomepage(false)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Page</h1>
          <p className="text-gray-500 mt-1">
            /{page.slug}
            {page.is_homepage && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Homepage</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/pages")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Settings */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Page Settings</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="meta">Meta Description</Label>
              <textarea
                id="meta"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1 w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="SEO description for this page..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="published">Published</Label>
            </div>

            {!page.is_homepage && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleSetAsHomepage}
                  disabled={isSettingHomepage}
                >
                  {isSettingHomepage ? "Setting..." : "Set as Homepage"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Make this page the homepage that visitors see when they land on your site
                </p>
              </div>
            )}
            {page.is_homepage && (
              <div className="pt-4 border-t">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800 font-medium">This is the homepage</p>
                  <p className="text-xs text-blue-600 mt-1">Visitors will see this page when they land on your site</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Page Sections */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Page Sections</h2>
              <SectionSelector pageId={page.id} templates={templates} sectionsCount={sections.length} />
            </div>

            <SectionList pageId={page.id} sections={sections} />
          </Card>
        </div>
      </div>
    </div>
  )
}
