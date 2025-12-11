"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Page {
  id: string
  title: string
  slug: string
  content: string | null
  design_json: any
  is_published: boolean
  tenant_id: string
}

interface GrapesJSPageEditorProps {
  tenantId: string
  tenantSlug: string
  page?: Page
}

// Your GrapesJS Studio SDK license key
const GRAPESJS_LICENSE_KEY = "2ba0c6133f6144aebbe2767cbbfac5a4423d7181a648457c94e3c03c0ac6fd94"

const PAGE_TEMPLATES = {
  blank: {
    name: "Blank Page",
    html: `<section style="min-height: 100vh; padding: 40px 20px;"></section>`,
  },
  landing: {
    name: "Landing Page",
    html: `
      <section data-gjs-name="Hero" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 60px 20px;">
        <div style="text-align: center; max-width: 800px;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.2;">Welcome to Our Ministry</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 20px; margin: 0 0 40px 0; line-height: 1.6;">Join us in making a difference in communities around the world through faith, hope, and love.</p>
          <a href="#" style="background: white; color: #667eea; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px;">Get Involved</a>
        </div>
      </section>
      <section data-gjs-name="Mission" style="padding: 80px 20px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Our Mission</h2>
          <p style="text-align: center; color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto;">We're dedicated to serving communities and spreading hope through practical ministry.</p>
        </div>
      </section>
    `,
  },
}

function GrapesJSPageEditor({ tenantId, tenantSlug, page }: GrapesJSPageEditorProps) {
  const router = useRouter()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)
  const [pageTitle, setPageTitle] = useState(page?.title || "Untitled Page")
  const [pageSlug, setPageSlug] = useState(page?.slug || "untitled-page")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  // Initialize GrapesJS Studio SDK
  useEffect(() => {
    if (!editorContainerRef.current || editorInstanceRef.current) return

    const initStudioEditor = async () => {
      try {
        // Dynamic import of Studio SDK
        const { default: createStudioEditor } = await import("@grapesjs/studio-sdk")
        await import("@grapesjs/studio-sdk/style")

        // Get initial content
        let initialHtml = PAGE_TEMPLATES.blank.html
        let initialCss = ""

        if (page?.design_json) {
          try {
            const designData = typeof page.design_json === "string" ? JSON.parse(page.design_json) : page.design_json
            initialHtml = designData.html || designData["gjs-html"] || PAGE_TEMPLATES.blank.html
            initialCss = designData.css || designData["gjs-css"] || ""
          } catch (e) {
            console.error("Error parsing design_json:", e)
          }
        } else if (page?.content) {
          initialHtml = page.content
        }

        // Create Studio Editor
        const editor = await createStudioEditor({
          root: editorContainerRef.current!,
          licenseKey: GRAPESJS_LICENSE_KEY,

          // Project configuration
          project: {
            type: "web",
            default: {
              pages: [
                {
                  name: pageTitle,
                  component: initialHtml,
                  styles: initialCss,
                },
              ],
            },
          },

          // Global styles configuration
          globalStyles: {
            default: [
              // Colors
              {
                id: "colorPrimary",
                property: "color",
                field: "color",
                defaultValue: "#7c3aed",
                selector: ":root",
                label: "Primary",
                category: "Colors",
              },
              {
                id: "colorSecondary",
                property: "color",
                field: "color",
                defaultValue: "#64748b",
                selector: ":root",
                label: "Secondary",
                category: "Colors",
              },
              {
                id: "colorAccent",
                property: "color",
                field: "color",
                defaultValue: "#f59e0b",
                selector: ":root",
                label: "Accent",
                category: "Colors",
              },
              {
                id: "colorSuccess",
                property: "color",
                field: "color",
                defaultValue: "#22c55e",
                selector: ":root",
                label: "Success",
                category: "Colors",
              },
              {
                id: "colorWarning",
                property: "color",
                field: "color",
                defaultValue: "#eab308",
                selector: ":root",
                label: "Warning",
                category: "Colors",
              },
              {
                id: "colorError",
                property: "color",
                field: "color",
                defaultValue: "#ef4444",
                selector: ":root",
                label: "Error",
                category: "Colors",
              },
              // Typography - Body
              {
                id: "bodyBg",
                property: "background-color",
                field: "color",
                defaultValue: "#ffffff",
                selector: "body",
                label: "Background",
                category: "Body",
              },
              {
                id: "bodyColor",
                property: "color",
                field: "color",
                defaultValue: "#1f2937",
                selector: "body",
                label: "Color",
                category: "Body",
              },
              {
                id: "bodyFontSize",
                property: "font-size",
                field: { type: "number", min: 0.5, max: 3, step: 0.1, units: ["rem"] },
                defaultValue: "1rem",
                selector: "body",
                label: "Font Size",
                category: "Body",
              },
              // Typography - Headings
              {
                id: "h1Color",
                property: "color",
                field: "color",
                defaultValue: "#1f2937",
                selector: "h1",
                label: "H1 Color",
                category: "Heading",
              },
              {
                id: "h1Size",
                property: "font-size",
                field: { type: "number", min: 1, max: 6, step: 0.1, units: ["rem"] },
                defaultValue: "2.5rem",
                selector: "h1",
                label: "H1 Size",
                category: "Heading",
              },
            ],
          },

          // Storage - disable auto-save, we handle saving manually
          storage: false,

          // Assets configuration
          assets: {
            uploadFile: async (file: File) => {
              // You can implement file upload to your storage here
              // For now, return a placeholder
              return URL.createObjectURL(file)
            },
          },
        })

        editorInstanceRef.current = editor
        setEditorReady(true)

        console.log("[v0] GrapesJS Studio SDK initialized successfully")
      } catch (error) {
        console.error("[v0] Error initializing GrapesJS Studio SDK:", error)
        toast.error("Failed to initialize page editor")
      }
    }

    initStudioEditor()

    return () => {
      if (editorInstanceRef.current?.destroy) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [page, pageTitle])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!editorInstanceRef.current) {
      toast.error("Editor not ready")
      return
    }

    setIsSaving(true)

    try {
      const editor = editorInstanceRef.current

      // Get HTML and CSS from Studio SDK
      const html = editor.getHtml?.() || ""
      const css = editor.getCss?.() || ""
      const projectData = editor.getProjectData?.() || {}

      const designJson = {
        html,
        css,
        "gjs-html": html,
        "gjs-css": css,
        projectData,
      }

      if (page?.id) {
        // Update existing page
        const result = await updateTenantPage(page.id, {
          title: pageTitle,
          slug: pageSlug,
          content: html,
          design_json: designJson,
          is_published: isPublished,
        })

        if (result.error) {
          throw new Error(result.error)
        }

        toast.success("Page updated successfully")
      } else {
        // Create new page
        const result = await createTenantPage({
          tenant_id: tenantId,
          title: pageTitle,
          slug: pageSlug,
          content: html,
          design_json: designJson,
          is_published: isPublished,
        })

        if (result.error) {
          throw new Error(result.error)
        }

        toast.success("Page created successfully")

        // Redirect to edit page with new ID
        if (result.data?.id) {
          router.push(`/${tenantSlug}/admin/pages/${result.data.id}/edit`)
        }
      }
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }, [page, pageTitle, pageSlug, isPublished, tenantId, tenantSlug, router])

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="h-6 w-px bg-gray-200" />

          <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
            Page Settings
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            <Label htmlFor="published" className="text-gray-600">
              {isPublished ? "Published" : "Draft"}
            </Label>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* GrapesJS Studio SDK Container - takes full remaining height */}
      <div ref={editorContainerRef} className="flex-1 w-full" style={{ minHeight: "calc(100vh - 57px)" }} />

      {/* Page Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={pageTitle}
                onChange={(e) => {
                  setPageTitle(e.target.value)
                  if (!page?.id) {
                    setPageSlug(generateSlug(e.target.value))
                  }
                }}
                placeholder="Enter page title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSlug">URL Slug</Label>
              <Input
                id="pageSlug"
                value={pageSlug}
                onChange={(e) => setPageSlug(generateSlug(e.target.value))}
                placeholder="page-url-slug"
              />
              <p className="text-xs text-gray-500">
                /{tenantSlug}/p/{pageSlug}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="publishedModal" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="publishedModal">Published</Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { GrapesJSPageEditor }
export default GrapesJSPageEditor
