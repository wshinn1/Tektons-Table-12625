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
        // Dynamic import of Studio SDK and plugins
        const { default: createStudioEditor } = await import("@grapesjs/studio-sdk")
        await import("@grapesjs/studio-sdk/style")

        const { layoutSidebarButtons, flexColumns, proseMirror, fullSize, lightGallery, listPages } = await import(
          "@grapesjs/studio-sdk-plugins"
        )

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

          plugins: [
            // Sidebar with Blocks, Layers, Assets, Global Styles panels
            layoutSidebarButtons.init({}),
            // Flex Columns - CSS Flexbox-based responsive columns with drag-resize
            flexColumns.init({}),
            // ProseMirror - Enhanced rich text editor with formatting options
            proseMirror.init({}),
            // Full Size - Full-size editing mode
            fullSize.init({}),
            // Light Gallery - Image gallery/lightbox support
            lightGallery.init({}),
            // List Pages - Page listing and management
            listPages.init({}),
          ],

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

          blockManager: {
            blocks: [
              // Basic blocks
              {
                id: "section",
                label: "Section",
                category: "Basic",
                content: '<section style="padding: 50px 20px; min-height: 200px;"></section>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 18H3V6h18v12zm-2-2V8H5v8h14z"/></svg>',
              },
              {
                id: "container",
                label: "Container",
                category: "Basic",
                content: '<div style="max-width: 1200px; margin: 0 auto; padding: 20px;"></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/></svg>',
              },
              {
                id: "text",
                label: "Text",
                category: "Basic",
                content: '<p style="padding: 10px;">Insert your text here</p>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h14v2h-6v14h-2V4H5V4z"/></svg>',
              },
              {
                id: "heading",
                label: "Heading",
                category: "Basic",
                content: '<h1 style="padding: 10px;">Heading</h1>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 4v7h6V4h2v16h-2v-7H5v7H3V4h2zm16 2v4h-4v10h-2V4h6v2z"/></svg>',
              },
              {
                id: "link",
                label: "Link",
                category: "Basic",
                content: '<a href="#" style="padding: 10px; display: inline-block;">Link</a>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
              },
              {
                id: "image",
                label: "Image",
                category: "Media",
                content: '<img src="/placeholder.svg?height=200&width=300" style="max-width: 100%; display: block;"/>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
              },
              {
                id: "video",
                label: "Video",
                category: "Media",
                content:
                  '<video style="width: 100%; max-width: 640px;" controls><source src="" type="video/mp4"/>Your browser does not support the video tag.</video>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>',
              },
              {
                id: "map",
                label: "Map",
                category: "Media",
                content:
                  '<iframe src="https://maps.google.com/maps?q=New+York&t=&z=13&ie=UTF8&iwloc=&output=embed" style="width: 100%; height: 300px; border: 0;"></iframe>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>',
              },
              // Layout blocks - Flex Columns plugin will add its own, but we keep these too
              {
                id: "column1",
                label: "1 Column",
                category: "Layout",
                content:
                  '<div style="display: flex; flex-direction: column; padding: 10px;"><div style="flex: 1; padding: 10px; min-height: 75px;"></div></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>',
              },
              {
                id: "column2",
                label: "2 Columns",
                category: "Layout",
                content:
                  '<div style="display: flex; padding: 10px; gap: 10px;"><div style="flex: 1; padding: 10px; min-height: 75px;"></div><div style="flex: 1; padding: 10px; min-height: 75px;"></div></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h7v16H4zm9 0h7v16h-7z"/></svg>',
              },
              {
                id: "column3",
                label: "3 Columns",
                category: "Layout",
                content:
                  '<div style="display: flex; padding: 10px; gap: 10px;"><div style="flex: 1; padding: 10px; min-height: 75px;"></div><div style="flex: 1; padding: 10px; min-height: 75px;"></div><div style="flex: 1; padding: 10px; min-height: 75px;"></div></div>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h4v16H4zm6 0h4v16h-4zm6 0h4v16h-4z"/></svg>',
              },
              {
                id: "column37",
                label: "2 Columns 3/7",
                category: "Layout",
                content:
                  '<div style="display: flex; padding: 10px; gap: 10px;"><div style="flex: 3; padding: 10px; min-height: 75px;"></div><div style="flex: 7; padding: 10px; min-height: 75px;"></div></div>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h5v16H4zm7 0h9v16h-9z"/></svg>',
              },
              // Component blocks
              {
                id: "button",
                label: "Button",
                category: "Components",
                content:
                  '<a href="#" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Button</a>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/></svg>',
              },
              {
                id: "divider",
                label: "Divider",
                category: "Components",
                content: '<hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>',
              },
              {
                id: "spacer",
                label: "Spacer",
                category: "Components",
                content: '<div style="height: 50px;"></div>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 18h3v-3H8v3zm0-5h3v-3H8v3zm0-5h3V5H8v3z"/></svg>',
              },
              {
                id: "icon",
                label: "Icon",
                category: "Components",
                content: '<span style="font-size: 24px;">★</span>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
              },
              // Form blocks
              {
                id: "form",
                label: "Form",
                category: "Forms",
                content:
                  '<form style="padding: 20px;"><div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 5px; font-weight: 500;">Name</label><input type="text" placeholder="Enter your name" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/></div><div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 5px; font-weight: 500;">Email</label><input type="email" placeholder="Enter your email" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/></div><button type="submit" style="padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Submit</button></form>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3v-12h18v12z"/></svg>',
              },
              {
                id: "input",
                label: "Input",
                category: "Forms",
                content:
                  '<input type="text" placeholder="Enter text..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"/>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
              },
              {
                id: "textarea",
                label: "Textarea",
                category: "Forms",
                content:
                  '<textarea placeholder="Enter your message..." style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; min-height: 100px;"></textarea>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>',
              },
              {
                id: "select",
                label: "Select",
                category: "Forms",
                content:
                  '<select style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;"><option value="">Select an option</option><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option></select>',
                media: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>',
              },
              {
                id: "checkbox",
                label: "Checkbox",
                category: "Forms",
                content:
                  '<label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox"/> Checkbox label</label>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
              },
              {
                id: "radio",
                label: "Radio",
                category: "Forms",
                content:
                  '<label style="display: flex; align-items: center; gap: 8px;"><input type="radio" name="radio"/> Radio label</label>',
                media:
                  '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
              },
            ],
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
