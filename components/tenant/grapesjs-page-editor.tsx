"use client"

import { useRef, useState, useEffect } from "react"
import type { Editor } from "grapesjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

const PAGE_TEMPLATES = {
  blank: {
    name: "Blank Page",
    html: `<section class="min-h-screen bg-white"></section>`,
  },
  landing: {
    name: "Landing Page",
    html: `
      <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 60px 20px;">
        <div style="text-align: center; max-width: 800px;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.2;">Welcome to Our Ministry</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 20px; margin: 0 0 40px 0; line-height: 1.6;">Join us in making a difference in communities around the world through faith, hope, and love.</p>
          <a href="#" style="background: white; color: #667eea; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px;">Get Involved</a>
        </div>
      </section>
      <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Our Mission</h2>
          <p style="text-align: center; color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto 60px auto;">We're dedicated to serving communities and spreading hope through practical ministry.</p>
        </div>
      </section>
    `,
  },
  about: {
    name: "About Page",
    html: `
      <section style="background: #1f2937; padding: 80px 20px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 16px 0;">About Us</h1>
          <p style="color: #9ca3af; font-size: 18px; margin: 0;">Learn more about our story and mission</p>
        </div>
      </section>
    `,
  },
  contact: {
    name: "Contact Page",
    html: `
      <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Contact Us</h1>
          <p style="color: #6b7280; font-size: 18px; margin: 0 0 40px 0;">We'd love to hear from you</p>
        </div>
      </section>
    `,
  },
}

function GrapesJSPageEditor({ tenantId, tenantSlug, page }: GrapesJSPageEditorProps) {
  const router = useRouter()
  const editorRef = useRef<Editor | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageTitle, setPageTitle] = useState(page?.title || "Untitled Page")
  const [pageSlug, setPageSlug] = useState(page?.slug || "untitled-page")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank")

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  // Initialize GrapesJS
  useEffect(() => {
    if (!containerRef.current || editorLoaded) return

    const initEditor = async () => {
      // Dynamically import GrapesJS and plugins
      const grapesjs = (await import("grapesjs")).default
      const gjsBlocksBasic = (await import("grapesjs-blocks-basic")).default
      const gjsPresetWebpage = (await import("grapesjs-preset-webpage")).default
      const gjsBlocksFlexbox = (await import("grapesjs-blocks-flexbox")).default
      const gjsStyleBg = (await import("grapesjs-style-bg")).default

      // Load CSS
      await import("grapesjs/dist/css/grapes.min.css")

      const editor = grapesjs.init({
        container: containerRef.current!,
        height: "100%",
        width: "auto",
        fromElement: false,
        storageManager: false,

        // Use the preset-webpage for full demo-like experience
        plugins: [gjsBlocksBasic, gjsPresetWebpage, gjsBlocksFlexbox, gjsStyleBg],
        pluginsOpts: {
          [gjsBlocksBasic as any]: {
            flexGrid: true,
            stylePrefix: "gjs-",
          },
          [gjsPresetWebpage as any]: {
            modalImportTitle: "Import Template",
            modalImportButton: "Import",
            modalImportLabel: "Paste your HTML/CSS here",
            textCleanCanvas: "Are you sure you want to clear the canvas?",
            showStylesOnChange: true,
            useCustomTheme: true,
          },
          [gjsBlocksFlexbox as any]: {
            flexboxBlock: {},
          },
          [gjsStyleBg as any]: {},
        },

        // Canvas configuration
        canvas: {
          styles: ["https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"],
        },

        // Device manager for responsive design
        deviceManager: {
          devices: [
            { name: "Desktop", width: "" },
            { name: "Tablet", width: "768px", widthMedia: "992px" },
            { name: "Mobile", width: "320px", widthMedia: "480px" },
          ],
        },

        // Panels configuration - matching the demo layout
        panels: {
          defaults: [
            {
              id: "panel-switcher",
              el: ".panel__switcher",
              buttons: [
                {
                  id: "show-layers",
                  active: true,
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>`,
                  command: "show-layers",
                  togglable: false,
                },
                {
                  id: "show-style",
                  active: true,
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14z"></path></svg>`,
                  command: "show-styles",
                  togglable: false,
                },
                {
                  id: "show-traits",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 8a4 4 0 100 8 4 4 0 000-8zm0-6a10 10 0 100 20 10 10 0 000-20z"></path></svg>`,
                  command: "show-traits",
                  togglable: false,
                },
                {
                  id: "show-blocks",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"></path></svg>`,
                  command: "show-blocks",
                  togglable: false,
                },
              ],
            },
            {
              id: "panel-devices",
              el: ".panel__devices",
              buttons: [
                {
                  id: "device-desktop",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"></path></svg>`,
                  command: "set-device-desktop",
                  active: true,
                  togglable: false,
                },
                {
                  id: "device-tablet",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z"></path></svg>`,
                  command: "set-device-tablet",
                  togglable: false,
                },
                {
                  id: "device-mobile",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"></path></svg>`,
                  command: "set-device-mobile",
                  togglable: false,
                },
              ],
            },
            {
              id: "layers",
              el: ".panel__layers",
              resizable: {
                maxDim: 350,
                minDim: 200,
                tc: false,
                cl: false,
                cr: true,
                bc: false,
                keyWidth: "flex-basis",
              },
            },
            {
              id: "panel-top",
              el: ".panel__top",
            },
            {
              id: "basic-actions",
              el: ".panel__basic-actions",
              buttons: [
                {
                  id: "visibility",
                  active: true,
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>`,
                  command: "sw-visibility",
                },
                {
                  id: "fullscreen",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>`,
                  command: "fullscreen",
                },
                {
                  id: "export",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"></path></svg>`,
                  command: "export-template",
                },
                {
                  id: "show-json",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>`,
                  command: "gjs-open-import-webpage",
                },
                {
                  id: "undo",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>`,
                  command: "core:undo",
                },
                {
                  id: "redo",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>`,
                  command: "core:redo",
                },
                {
                  id: "canvas-clear",
                  label: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`,
                  command: "canvas-clear",
                },
              ],
            },
            {
              id: "styles",
              el: ".panel__styles",
              resizable: {
                maxDim: 400,
                minDim: 250,
                tc: false,
                cl: true,
                cr: false,
                bc: false,
                keyWidth: "flex-basis",
              },
            },
          ],
        },

        // Selector manager
        selectorManager: {
          appendTo: ".styles-container",
        },

        // Style manager with all sectors like the demo
        styleManager: {
          appendTo: ".styles-container",
          sectors: [
            {
              name: "General",
              open: false,
              buildProps: ["float", "display", "position", "top", "right", "left", "bottom"],
            },
            {
              name: "Layout",
              open: false,
              buildProps: [
                "flex-direction",
                "flex-wrap",
                "justify-content",
                "align-items",
                "align-content",
                "order",
                "flex-basis",
                "flex-grow",
                "flex-shrink",
                "align-self",
                "gap",
              ],
            },
            {
              name: "Size",
              open: false,
              buildProps: ["width", "height", "max-width", "min-height", "margin", "padding"],
            },
            {
              name: "Typography",
              open: false,
              buildProps: [
                "font-family",
                "font-size",
                "font-weight",
                "letter-spacing",
                "color",
                "line-height",
                "text-align",
                "text-decoration",
                "text-shadow",
              ],
            },
            {
              name: "Decorations",
              open: false,
              buildProps: ["background-color", "border-radius", "border", "box-shadow"],
            },
            {
              name: "Extra",
              open: false,
              buildProps: ["opacity", "transition", "transform"],
            },
          ],
        },

        // Trait manager
        traitManager: {
          appendTo: ".traits-container",
        },

        // Layer manager
        layerManager: {
          appendTo: ".layers-container",
        },

        // Block manager
        blockManager: {
          appendTo: ".blocks-container",
        },
      })

      // Add custom commands
      editor.Commands.add("show-layers", {
        getRowEl(editor: Editor) {
          return editor.getContainer().closest(".editor-row")
        },
        getLayersEl(row: Element | null) {
          return row?.querySelector(".editor-clm")
        },
        run(editor: Editor) {
          const lmEl = this.getLayersEl(this.getRowEl(editor))
          if (lmEl) (lmEl as HTMLElement).style.display = ""
        },
        stop(editor: Editor) {
          const lmEl = this.getLayersEl(this.getRowEl(editor))
          if (lmEl) (lmEl as HTMLElement).style.display = "none"
        },
      })

      editor.Commands.add("show-styles", {
        getRowEl(editor: Editor) {
          return editor.getContainer().closest(".editor-row")
        },
        getStyleEl(row: Element | null) {
          return row?.querySelector(".styles-container")
        },
        run(editor: Editor) {
          const smEl = this.getStyleEl(this.getRowEl(editor))
          if (smEl) (smEl as HTMLElement).style.display = ""
        },
        stop(editor: Editor) {
          const smEl = this.getStyleEl(this.getRowEl(editor))
          if (smEl) (smEl as HTMLElement).style.display = "none"
        },
      })

      editor.Commands.add("show-traits", {
        getRowEl(editor: Editor) {
          return editor.getContainer().closest(".editor-row")
        },
        getTraitsEl(row: Element | null) {
          return row?.querySelector(".traits-container")
        },
        run(editor: Editor) {
          const trEl = this.getTraitsEl(this.getRowEl(editor))
          if (trEl) (trEl as HTMLElement).style.display = ""
        },
        stop(editor: Editor) {
          const trEl = this.getTraitsEl(this.getRowEl(editor))
          if (trEl) (trEl as HTMLElement).style.display = "none"
        },
      })

      editor.Commands.add("show-blocks", {
        getRowEl(editor: Editor) {
          return editor.getContainer().closest(".editor-row")
        },
        getBlocksEl(row: Element | null) {
          return row?.querySelector(".blocks-container")
        },
        run(editor: Editor) {
          const blEl = this.getBlocksEl(this.getRowEl(editor))
          if (blEl) (blEl as HTMLElement).style.display = ""
        },
        stop(editor: Editor) {
          const blEl = this.getBlocksEl(this.getRowEl(editor))
          if (blEl) (blEl as HTMLElement).style.display = "none"
        },
      })

      editor.Commands.add("set-device-desktop", {
        run: (editor: Editor) => editor.setDevice("Desktop"),
      })

      editor.Commands.add("set-device-tablet", {
        run: (editor: Editor) => editor.setDevice("Tablet"),
      })

      editor.Commands.add("set-device-mobile", {
        run: (editor: Editor) => editor.setDevice("Mobile"),
      })

      editor.Commands.add("fullscreen", {
        run() {
          const el = document.documentElement
          if (el.requestFullscreen) el.requestFullscreen()
        },
        stop() {
          if (document.exitFullscreen) document.exitFullscreen()
        },
      })

      editor.Commands.add("export-template", {
        run(editor: Editor) {
          const html = editor.getHtml()
          const css = editor.getCss()
          const modal = editor.Modal
          modal.setTitle("Export")
          modal.setContent(`
            <div style="padding: 20px;">
              <h4 style="margin-bottom: 10px;">HTML:</h4>
              <textarea style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">${html}</textarea>
              <h4 style="margin: 20px 0 10px;">CSS:</h4>
              <textarea style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">${css}</textarea>
            </div>
          `)
          modal.open()
        },
      })

      // Load existing content or template
      if (page?.design_json) {
        editor.loadProjectData(page.design_json)
      } else if (page?.content) {
        editor.setComponents(page.content)
      } else {
        editor.setComponents(PAGE_TEMPLATES.landing.html)
      }

      editorRef.current = editor
      setEditorLoaded(true)
    }

    initEditor()

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
        setEditorLoaded(false)
      }
    }
  }, [page])

  // Handle template change
  const handleTemplateChange = (templateKey: string) => {
    if (editorRef.current && PAGE_TEMPLATES[templateKey as keyof typeof PAGE_TEMPLATES]) {
      const template = PAGE_TEMPLATES[templateKey as keyof typeof PAGE_TEMPLATES]
      editorRef.current.setComponents(template.html)
      setSelectedTemplate(templateKey)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!editorRef.current) return

    setIsSaving(true)
    try {
      const html = editorRef.current.getHtml()
      const css = editorRef.current.getCss()
      const projectData = editorRef.current.getProjectData()

      const fullContent = `<style>${css}</style>${html}`

      if (page?.id) {
        await updateTenantPage(page.id, {
          title: pageTitle,
          slug: pageSlug,
          content: fullContent,
          design_json: projectData,
          is_published: isPublished,
        })
        toast.success("Page saved successfully!")
      } else {
        const result = await createTenantPage({
          tenant_id: tenantId,
          title: pageTitle,
          slug: pageSlug,
          content: fullContent,
          design_json: projectData,
          is_published: isPublished,
        })
        if (result.data) {
          toast.success("Page created successfully!")
          router.push(`/${tenantSlug}/admin/pages/${result.data.id}/edit`)
        }
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grapesjs-editor-wrapper h-screen flex flex-col bg-white">
      {/* Top header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="panel__basic-actions flex items-center" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                {PAGE_TEMPLATES[selectedTemplate as keyof typeof PAGE_TEMPLATES]?.name || "Select Template"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(PAGE_TEMPLATES).map(([key, template]) => (
                <DropdownMenuItem key={key} onClick={() => handleTemplateChange(key)}>
                  {template.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="panel__devices flex items-center gap-1" />

        <div className="flex items-center gap-3">
          <div className="panel__switcher flex items-center" />
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-1 bg-violet-600 hover:bg-violet-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main editor area with native GrapesJS layout */}
      <div className="editor-row flex flex-1 overflow-hidden">
        {/* Left panel - Layers */}
        <div className="editor-clm flex flex-col border-r bg-slate-50" style={{ flexBasis: "250px" }}>
          {/* Pages section */}
          <div className="p-3 border-b">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Pages</div>
            <div className="bg-white rounded border px-3 py-2 text-sm font-medium truncate">
              {pageTitle || "Untitled Page"}
            </div>
          </div>

          {/* Layers */}
          <div className="flex-1 overflow-auto">
            <div className="p-3 border-b">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Layers</div>
            </div>
            <div className="layers-container" />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="panel__top" />
          <div ref={containerRef} className="flex-1 overflow-auto" />
        </div>

        {/* Right panel - Styles/Traits/Blocks */}
        <div className="flex flex-col border-l bg-slate-50" style={{ flexBasis: "300px" }}>
          {/* Panel tabs handled by GrapesJS */}
          <div className="panel__styles" />

          {/* Styles container */}
          <div className="styles-container flex-1 overflow-auto" />

          {/* Traits container (hidden by default) */}
          <div className="traits-container overflow-auto" style={{ display: "none" }} />

          {/* Blocks container (hidden by default) */}
          <div className="blocks-container overflow-auto" style={{ display: "none" }} />

          {/* Page Settings */}
          <div className="border-t p-4 bg-white">
            <div className="text-sm font-medium mb-3">Page Settings</div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-500">Page Title</Label>
                <Input
                  value={pageTitle}
                  onChange={(e) => {
                    setPageTitle(e.target.value)
                    if (!page?.id) setPageSlug(generateSlug(e.target.value))
                  }}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">URL Slug</Label>
                <Input
                  value={pageSlug}
                  onChange={(e) => setPageSlug(generateSlug(e.target.value))}
                  className="mt-1 h-8 text-sm"
                />
                <span className="text-xs text-slate-400">
                  /{tenantSlug}/p/{pageSlug}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Published</Label>
                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GrapesJS custom styles */}
      <style jsx global>{`
        /* Override GrapesJS default styles to match demo */
        .gjs-one-bg {
          background-color: #f8fafc !important;
        }
        
        .gjs-two-color {
          color: #334155 !important;
        }
        
        .gjs-three-bg {
          background-color: #e2e8f0 !important;
        }
        
        .gjs-four-color,
        .gjs-four-color-h:hover {
          color: #7c3aed !important;
        }
        
        /* Panels */
        .gjs-pn-panel {
          padding: 0;
        }
        
        .gjs-pn-buttons {
          display: flex;
          gap: 2px;
        }
        
        .gjs-pn-btn {
          padding: 8px;
          border-radius: 4px;
          min-height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .gjs-pn-btn:hover {
          background-color: #e2e8f0;
        }
        
        .gjs-pn-btn.gjs-pn-active {
          background-color: #7c3aed !important;
          color: white !important;
        }
        
        .gjs-pn-btn.gjs-pn-active svg {
          fill: white;
        }
        
        /* Blocks */
        .gjs-blocks-c {
          padding: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .gjs-block {
          width: calc(50% - 4px) !important;
          min-height: 60px !important;
          border-radius: 8px;
          padding: 10px;
          margin: 0 !important;
          border: 1px solid #e2e8f0;
          background: white !important;
          transition: all 0.15s ease;
        }
        
        .gjs-block:hover {
          border-color: #7c3aed;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
        }
        
        .gjs-block__media {
          margin-bottom: 8px;
        }
        
        .gjs-block-label {
          font-size: 11px !important;
          font-weight: 500;
          color: #64748b;
        }
        
        /* Layers */
        .gjs-layers {
          background: transparent !important;
        }
        
        .gjs-layer {
          background: transparent;
          padding: 0;
        }
        
        .gjs-layer-title {
          padding: 8px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .gjs-layer-title:hover {
          background: #e2e8f0;
        }
        
        .gjs-layer.gjs-selected .gjs-layer-title {
          background: #7c3aed !important;
          color: white !important;
        }
        
        .gjs-layer-children {
          padding-left: 16px;
        }
        
        /* Style Manager */
        .gjs-sm-sector {
          border: none !important;
          margin-bottom: 4px;
        }
        
        .gjs-sm-sector-title {
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          background: white !important;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        
        .gjs-sm-sector-title:hover {
          background: #f8fafc !important;
        }
        
        .gjs-sm-properties {
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        
        .gjs-sm-property {
          margin-bottom: 8px;
        }
        
        .gjs-sm-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .gjs-field {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 4px !important;
          padding: 6px 8px;
        }
        
        .gjs-field:focus-within {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
        }
        
        .gjs-field input {
          color: #334155 !important;
          font-size: 12px;
        }
        
        /* Selector Manager */
        .gjs-clm-tags {
          padding: 12px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .gjs-clm-tag {
          background: #7c3aed !important;
          color: white !important;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 11px;
        }
        
        .gjs-clm-sels-info {
          font-size: 11px;
          color: #64748b;
        }
        
        /* Canvas */
        .gjs-cv-canvas {
          background: #f1f5f9;
        }
        
        .gjs-frame-wrapper {
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        
        /* Selected component highlight */
        .gjs-selected {
          outline: 2px solid #7c3aed !important;
          outline-offset: -2px;
        }
        
        /* Toolbar */
        .gjs-toolbar {
          background: #1e293b !important;
          border-radius: 6px !important;
          padding: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .gjs-toolbar-item {
          padding: 6px !important;
          border-radius: 4px;
          color: white !important;
        }
        
        .gjs-toolbar-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Traits */
        .gjs-trt-traits {
          padding: 12px;
        }
        
        .gjs-trt-trait {
          margin-bottom: 10px;
        }
        
        .gjs-trt-trait .gjs-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        
        /* Modal */
        .gjs-mdl-dialog {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .gjs-mdl-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 20px;
        }
        
        .gjs-mdl-title {
          font-weight: 600;
          color: #1e293b;
        }
        
        .gjs-mdl-content {
          padding: 0;
        }
        
        /* Resize handlers */
        .gjs-resizer-h {
          background: #7c3aed !important;
          width: 8px !important;
          border-radius: 4px;
        }
        
        /* Component badge */
        .gjs-badge {
          background: #7c3aed !important;
          color: white !important;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        /* Rich Text Editor */
        .gjs-rte-toolbar {
          background: #1e293b;
          border-radius: 6px;
          padding: 4px;
        }
        
        .gjs-rte-action {
          color: white;
          padding: 6px;
          border-radius: 4px;
        }
        
        .gjs-rte-action:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .gjs-rte-active {
          background: #7c3aed !important;
        }
      `}</style>
    </div>
  )
}

export { GrapesJSPageEditor }
export default GrapesJSPageEditor
