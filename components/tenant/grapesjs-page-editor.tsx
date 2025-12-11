"use client"

import { useRef, useState, useEffect } from "react"
import type { Editor } from "grapesjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, ChevronDown, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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
          <p style="text-align: center; color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto 60px auto;">We're dedicated to serving communities and spreading hope through practical ministry.</p>
        </div>
      </section>
    `,
  },
  about: {
    name: "About Page",
    html: `
      <section data-gjs-name="Header" style="background: #1f2937; padding: 80px 20px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 16px 0;">About Us</h1>
          <p style="color: #9ca3af; font-size: 18px; margin: 0;">Learn more about our story and mission</p>
        </div>
      </section>
      <section data-gjs-name="Content" style="padding: 80px 20px; background: white;">
        <div style="max-width: 800px; margin: 0 auto;">
          <p style="color: #4b5563; font-size: 18px; line-height: 1.8;">Add your about content here...</p>
        </div>
      </section>
    `,
  },
  contact: {
    name: "Contact Page",
    html: `
      <section data-gjs-name="Contact" style="padding: 80px 20px; background: white;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h1 style="font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Contact Us</h1>
          <p style="color: #6b7280; font-size: 18px; margin: 0 0 40px 0;">We'd love to hear from you</p>
        </div>
      </section>
    `,
  },
}

const DEFAULT_GLOBAL_STYLES = {
  colors: {
    primary: "#7c3aed",
    secondary: "#64748b",
    accent: "#f59e0b",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  body: {
    background: "inherit",
    color: "inherit",
    fontSize: "1rem",
    lineHeight: "1.75rem",
    fontFamily: "Arial",
  },
  heading: {
    color: "#1f2937",
    fontSize: "1.5rem",
    lineHeight: "2.5rem",
    fontFamily: "Default",
  },
  subheading: {
    color: "#64748b",
    fontSize: "1.2rem",
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

  const [leftPanel, setLeftPanel] = useState<"blocks" | "layers">("blocks")
  const [rightPanel, setRightPanel] = useState<"styles" | "properties">("styles")
  const [showGlobalStyles, setShowGlobalStyles] = useState(false)
  const [globalStyles, setGlobalStyles] = useState(DEFAULT_GLOBAL_STYLES)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

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
      const grapesjs = (await import("grapesjs")).default
      const gjsBlocksBasic = (await import("grapesjs-blocks-basic")).default
      const gjsPresetWebpage = (await import("grapesjs-preset-webpage")).default
      const gjsBlocksFlexbox = (await import("grapesjs-blocks-flexbox")).default
      const gjsStyleBg = (await import("grapesjs-style-bg")).default

      await import("grapesjs/dist/css/grapes.min.css")

      const editor = grapesjs.init({
        container: containerRef.current!,
        height: "100%",
        width: "auto",
        fromElement: false,
        storageManager: false,

        plugins: [gjsBlocksBasic, gjsPresetWebpage, gjsBlocksFlexbox, gjsStyleBg],
        pluginsOpts: {
          [gjsBlocksBasic as any]: {
            flexGrid: true,
            stylePrefix: "gjs-",
            blocks: ["column1", "column2", "column3", "column3-7", "text", "link", "image", "video", "map"],
          },
          [gjsPresetWebpage as any]: {
            modalImportTitle: "Import Template",
            modalImportButton: "Import",
            modalImportLabel: "Paste your HTML/CSS here",
            showStylesOnChange: true,
          },
          [gjsBlocksFlexbox as any]: {},
          [gjsStyleBg as any]: {},
        },

        canvas: {
          styles: ["https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"],
        },

        // Device manager
        deviceManager: {
          devices: [
            { name: "Desktop", width: "" },
            { name: "Tablet", width: "768px", widthMedia: "992px" },
            { name: "Mobile", width: "320px", widthMedia: "480px" },
          ],
        },

        panels: { defaults: [] },

        // Selector manager
        selectorManager: {
          appendTo: "#selector-container",
          componentFirst: true,
        },

        styleManager: {
          appendTo: "#styles-container",
          sectors: [
            {
              name: "Layout",
              open: false,
              properties: [
                {
                  type: "select",
                  property: "display",
                  options: [
                    { id: "block", label: "Block" },
                    { id: "flex", label: "Flex" },
                    { id: "grid", label: "Grid" },
                    { id: "inline-block", label: "Inline Block" },
                    { id: "inline", label: "Inline" },
                    { id: "none", label: "None" },
                  ],
                },
                {
                  type: "select",
                  property: "flex-direction",
                  options: [
                    { id: "row", label: "Row" },
                    { id: "row-reverse", label: "Row Reverse" },
                    { id: "column", label: "Column" },
                    { id: "column-reverse", label: "Column Reverse" },
                  ],
                },
                {
                  type: "select",
                  property: "justify-content",
                  options: [
                    { id: "flex-start", label: "Start" },
                    { id: "flex-end", label: "End" },
                    { id: "center", label: "Center" },
                    { id: "space-between", label: "Space Between" },
                    { id: "space-around", label: "Space Around" },
                    { id: "space-evenly", label: "Space Evenly" },
                  ],
                },
                {
                  type: "select",
                  property: "align-items",
                  options: [
                    { id: "flex-start", label: "Start" },
                    { id: "flex-end", label: "End" },
                    { id: "center", label: "Center" },
                    { id: "stretch", label: "Stretch" },
                    { id: "baseline", label: "Baseline" },
                  ],
                },
                {
                  type: "select",
                  property: "flex-wrap",
                  options: [
                    { id: "nowrap", label: "No Wrap" },
                    { id: "wrap", label: "Wrap" },
                    { id: "wrap-reverse", label: "Wrap Reverse" },
                  ],
                },
                { type: "number", property: "gap", units: ["px", "em", "rem", "%"] },
              ],
            },
            {
              name: "Size",
              open: false,
              properties: [
                { type: "number", property: "width", units: ["px", "%", "vw", "auto"] },
                { type: "number", property: "min-width", units: ["px", "%", "vw"] },
                { type: "number", property: "max-width", units: ["px", "%", "vw"] },
                { type: "number", property: "height", units: ["px", "%", "vh", "auto"] },
                { type: "number", property: "min-height", units: ["px", "%", "vh"] },
                { type: "number", property: "max-height", units: ["px", "%", "vh"] },
              ],
            },
            {
              name: "Space",
              open: false,
              properties: [
                {
                  type: "composite",
                  property: "margin",
                  properties: [
                    { type: "number", property: "margin-top", units: ["px", "em", "rem", "%", "auto"] },
                    { type: "number", property: "margin-right", units: ["px", "em", "rem", "%", "auto"] },
                    { type: "number", property: "margin-bottom", units: ["px", "em", "rem", "%", "auto"] },
                    { type: "number", property: "margin-left", units: ["px", "em", "rem", "%", "auto"] },
                  ],
                },
                {
                  type: "composite",
                  property: "padding",
                  properties: [
                    { type: "number", property: "padding-top", units: ["px", "em", "rem", "%"] },
                    { type: "number", property: "padding-right", units: ["px", "em", "rem", "%"] },
                    { type: "number", property: "padding-bottom", units: ["px", "em", "rem", "%"] },
                    { type: "number", property: "padding-left", units: ["px", "em", "rem", "%"] },
                  ],
                },
              ],
            },
            {
              name: "Position",
              open: false,
              properties: [
                {
                  type: "select",
                  property: "position",
                  options: [
                    { id: "static", label: "Static" },
                    { id: "relative", label: "Relative" },
                    { id: "absolute", label: "Absolute" },
                    { id: "fixed", label: "Fixed" },
                    { id: "sticky", label: "Sticky" },
                  ],
                },
                { type: "number", property: "top", units: ["px", "%", "auto"] },
                { type: "number", property: "right", units: ["px", "%", "auto"] },
                { type: "number", property: "bottom", units: ["px", "%", "auto"] },
                { type: "number", property: "left", units: ["px", "%", "auto"] },
                { type: "number", property: "z-index" },
              ],
            },
            {
              name: "Typography",
              open: false,
              properties: [
                {
                  type: "select",
                  property: "font-family",
                  options: [
                    { id: "Arial, sans-serif", label: "Arial" },
                    { id: "'Inter', sans-serif", label: "Inter" },
                    { id: "Georgia, serif", label: "Georgia" },
                    { id: "'Times New Roman', serif", label: "Times New Roman" },
                    { id: "monospace", label: "Monospace" },
                  ],
                },
                { type: "number", property: "font-size", units: ["px", "em", "rem"] },
                {
                  type: "select",
                  property: "font-weight",
                  options: [
                    { id: "300", label: "Light" },
                    { id: "400", label: "Regular" },
                    { id: "500", label: "Medium" },
                    { id: "600", label: "Semibold" },
                    { id: "700", label: "Bold" },
                  ],
                },
                { type: "number", property: "line-height", units: ["px", "em", "rem", ""] },
                { type: "number", property: "letter-spacing", units: ["px", "em"] },
                { type: "color", property: "color" },
                {
                  type: "select",
                  property: "text-align",
                  options: [
                    { id: "left", label: "Left" },
                    { id: "center", label: "Center" },
                    { id: "right", label: "Right" },
                    { id: "justify", label: "Justify" },
                  ],
                },
                {
                  type: "select",
                  property: "text-decoration",
                  options: [
                    { id: "none", label: "None" },
                    { id: "underline", label: "Underline" },
                    { id: "line-through", label: "Line Through" },
                  ],
                },
                {
                  type: "select",
                  property: "text-transform",
                  options: [
                    { id: "none", label: "None" },
                    { id: "uppercase", label: "Uppercase" },
                    { id: "lowercase", label: "Lowercase" },
                    { id: "capitalize", label: "Capitalize" },
                  ],
                },
              ],
            },
            {
              name: "Background",
              open: false,
              properties: [
                { type: "color", property: "background-color" },
                { type: "file", property: "background-image" },
                {
                  type: "select",
                  property: "background-size",
                  options: [
                    { id: "auto", label: "Auto" },
                    { id: "cover", label: "Cover" },
                    { id: "contain", label: "Contain" },
                  ],
                },
                {
                  type: "select",
                  property: "background-position",
                  options: [
                    { id: "center", label: "Center" },
                    { id: "top", label: "Top" },
                    { id: "bottom", label: "Bottom" },
                    { id: "left", label: "Left" },
                    { id: "right", label: "Right" },
                  ],
                },
                {
                  type: "select",
                  property: "background-repeat",
                  options: [
                    { id: "no-repeat", label: "No Repeat" },
                    { id: "repeat", label: "Repeat" },
                    { id: "repeat-x", label: "Repeat X" },
                    { id: "repeat-y", label: "Repeat Y" },
                  ],
                },
              ],
            },
            {
              name: "Borders",
              open: false,
              properties: [
                { type: "number", property: "border-radius", units: ["px", "%", "em"] },
                {
                  type: "composite",
                  property: "border",
                  properties: [
                    { type: "number", property: "border-width", units: ["px"] },
                    {
                      type: "select",
                      property: "border-style",
                      options: [
                        { id: "none", label: "None" },
                        { id: "solid", label: "Solid" },
                        { id: "dashed", label: "Dashed" },
                        { id: "dotted", label: "Dotted" },
                      ],
                    },
                    { type: "color", property: "border-color" },
                  ],
                },
              ],
            },
            {
              name: "Effects",
              open: false,
              properties: [
                { type: "slider", property: "opacity", min: 0, max: 1, step: 0.01 },
                {
                  type: "stack",
                  property: "box-shadow",
                  properties: [
                    { type: "number", property: "box-shadow-h", units: ["px"] },
                    { type: "number", property: "box-shadow-v", units: ["px"] },
                    { type: "number", property: "box-shadow-blur", units: ["px"] },
                    { type: "number", property: "box-shadow-spread", units: ["px"] },
                    { type: "color", property: "box-shadow-color" },
                  ],
                },
                {
                  type: "select",
                  property: "overflow",
                  options: [
                    { id: "visible", label: "Visible" },
                    { id: "hidden", label: "Hidden" },
                    { id: "scroll", label: "Scroll" },
                    { id: "auto", label: "Auto" },
                  ],
                },
                {
                  type: "select",
                  property: "cursor",
                  options: [
                    { id: "auto", label: "Auto" },
                    { id: "pointer", label: "Pointer" },
                    { id: "move", label: "Move" },
                    { id: "not-allowed", label: "Not Allowed" },
                  ],
                },
              ],
            },
          ],
        },

        // Trait manager
        traitManager: {
          appendTo: "#traits-container",
        },

        // Layer manager
        layerManager: {
          appendTo: "#layers-container",
          showWrapper: false,
        },

        // Block manager
        blockManager: {
          appendTo: "#blocks-container",
          blocks: [],
        },
      })

      const bm = editor.BlockManager

      // Layout blocks
      bm.add("section", {
        label: "Section",
        category: "Basic",
        content: `<section data-gjs-name="Section" style="padding: 60px 20px; min-height: 200px;"></section>`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/></svg>`,
      })

      bm.add("divider", {
        label: "Divider",
        category: "Basic",
        content: `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/></svg>`,
      })

      bm.add("heading", {
        label: "Heading",
        category: "Basic",
        content: `<h2 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">Heading</h2>`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><text x="4" y="18" fontSize="16" fontWeight="bold">H</text></svg>`,
      })

      bm.add("paragraph", {
        label: "Text",
        category: "Basic",
        content: `<p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0;">Insert your text here...</p>`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><text x="4" y="18" fontSize="14">T</text></svg>`,
      })

      bm.add("link-box", {
        label: "Link Box",
        category: "Basic",
        content: `<a href="#" style="display: block; padding: 10px;">Link Box</a>`,
        media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M10 12h4m-2-2v4"/></svg>`,
      })

      bm.add("image-box", {
        label: "Image Box",
        category: "Basic",
        content: `<div style="position: relative;"><img src="https://via.placeholder.com/400x250" style="width: 100%; display: block;" /><div style="padding: 16px;"><h4 style="margin: 0 0 8px 0;">Image Title</h4><p style="margin: 0; color: #6b7280;">Image description</p></div></div>`,
        media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><path d="M21 15l-5-5-4 4-3-3-6 6"/></svg>`,
      })

      bm.add("button", {
        label: "Button",
        category: "Basic",
        content: `<a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Button</a>`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="8" width="18" height="8" rx="4" /></svg>`,
      })

      bm.add("icon", {
        label: "Icon",
        category: "Basic",
        content: `<span style="font-size: 24px;">★</span>`,
        media: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`,
      })

      editor.on("component:selected", (component) => {
        if (component) {
          setSelectedComponent(component.getName() || component.get("type") || "Element")
        } else {
          setSelectedComponent(null)
        }
      })

      editor.on("component:deselected", () => {
        setSelectedComponent(null)
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

  // Template change handler
  const handleTemplateChange = (templateKey: string) => {
    if (editorRef.current && PAGE_TEMPLATES[templateKey as keyof typeof PAGE_TEMPLATES]) {
      const template = PAGE_TEMPLATES[templateKey as keyof typeof PAGE_TEMPLATES]
      editorRef.current.setComponents(template.html)
      setSelectedTemplate(templateKey)
    }
  }

  // Save handler
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

  // Editor commands
  const runCommand = (cmd: string) => {
    editorRef.current?.runCommand(cmd)
  }

  const setDevice = (device: string) => {
    editorRef.current?.setDevice(device)
  }

  const handleGlobalStyleChange = (category: string, property: string, value: string) => {
    setGlobalStyles((prev) => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [property]: value,
      },
    }))

    // Apply CSS variables to the canvas
    if (editorRef.current) {
      const frame = editorRef.current.Canvas.getFrameEl()
      if (frame?.contentDocument) {
        const root = frame.contentDocument.documentElement
        root.style.setProperty(`--${category}-${property}`, value)
      }
    }
  }

  return (
    <div className="grapesjs-editor-wrapper h-screen flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-l pl-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => runCommand("core:undo")}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
                />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => runCommand("core:redo")}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"
                />
              </svg>
            </Button>
          </div>

          {/* Template selector */}
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

        {/* Device switchers */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 data-[active=true]:bg-white data-[active=true]:shadow-sm"\
            data-[active=true]:bg-white data-[active=true]:shadow-sm
            onClick={() => setDevice("Desktop")}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"
              />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDevice("Tablet")}>
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z"
              />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDevice("Mobile")}>
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"
              />
            </svg>
          </Button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* More actions */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => runCommand("core:fullscreen")}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => runCommand("gjs-open-import-webpage")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
                />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => runCommand("sw-visibility")}>
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                />
              </svg>
            </Button>
          </div>

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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[280px] border-r bg-white flex flex-col">
          {/* Global Styles Toggle */}
          <button
            onClick={() => setShowGlobalStyles(!showGlobalStyles)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b hover:bg-slate-50 transition-colors",
              showGlobalStyles && "bg-slate-50",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
              />
            </svg>
            Global Styles
            <X className={cn("h-4 w-4 ml-auto transition-transform", showGlobalStyles ? "rotate-0" : "rotate-45")} />
          </button>

          {/* Global Styles Panel (like demo) */}
          {showGlobalStyles && (
            <div className="border-b overflow-auto max-h-[50vh]">
              {/* Colors */}
              <div className="border-b">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  Colors
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="px-4 pb-3 space-y-2">
                  {Object.entries(globalStyles.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs capitalize w-20 text-slate-600">{key}</label>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleGlobalStyleChange("colors", key, e.target.value)}
                          className="w-6 h-6 rounded border cursor-pointer"
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleGlobalStyleChange("colors", key, e.target.value)}
                          className="h-7 text-xs flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Styles */}
              <div className="border-b">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  Body
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="px-4 pb-3 space-y-2">
                  {Object.entries(globalStyles.body).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs capitalize w-24 text-slate-600">{key.replace(/([A-Z])/g, " $1")}</label>
                      <Input
                        value={value}
                        onChange={(e) => handleGlobalStyleChange("body", key, e.target.value)}
                        className="h-7 text-xs flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Heading Styles */}
              <div className="border-b">
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  Heading
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="px-4 pb-3 space-y-2">
                  {Object.entries(globalStyles.heading).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs capitalize w-24 text-slate-600">{key.replace(/([A-Z])/g, " $1")}</label>
                      {key === "color" ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleGlobalStyleChange("heading", key, e.target.value)}
                            className="w-6 h-6 rounded border cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleGlobalStyleChange("heading", key, e.target.value)}
                            className="h-7 text-xs flex-1"
                          />
                        </div>
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) => handleGlobalStyleChange("heading", key, e.target.value)}
                          className="h-7 text-xs flex-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs: Blocks / Layers */}
          <Tabs
            value={leftPanel}
            onValueChange={(v) => setLeftPanel(v as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
              <TabsTrigger value="blocks" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
                Blocks
              </TabsTrigger>
              <TabsTrigger value="layers" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
                Layers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="flex-1 overflow-auto m-0">
              {/* Blocks subtabs */}
              <div className="flex border-b">
                <button className="flex-1 py-2 text-xs font-medium text-violet-600 border-b-2 border-violet-600">
                  Regular
                </button>
                <button className="flex-1 py-2 text-xs font-medium text-slate-500 hover:text-slate-700">Symbols</button>
              </div>

              {/* Search */}
              <div className="p-3">
                <Input placeholder="Search..." className="h-8 text-sm" />
              </div>

              {/* Blocks container - GrapesJS will populate this */}
              <div id="blocks-container" className="px-2" />

              {/* Add more blocks button */}
              <div className="p-3 border-t mt-auto">
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add more blocks
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="layers" className="flex-1 overflow-auto m-0">
              {/* Pages */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase">Pages</span>
                  <Plus className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </div>
                <div className="bg-violet-50 text-violet-700 rounded px-3 py-2 text-sm font-medium truncate">
                  {pageTitle || "Untitled Page"}
                </div>
              </div>

              {/* Layers */}
              <div className="p-3">
                <span className="text-xs font-medium text-slate-500 uppercase">Layers</span>
              </div>
              <div id="layers-container" className="flex-1" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-slate-100 overflow-hidden">
          <div ref={containerRef} className="h-full" />
        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] border-l bg-white flex flex-col">
          {/* Tabs: Styles / Properties */}
          <Tabs
            value={rightPanel}
            onValueChange={(v) => setRightPanel(v as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
              <TabsTrigger value="styles" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
                Styles
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-transparent py-2 text-sm">
                Properties
              </TabsTrigger>
            </TabsList>

            <TabsContent value="styles" className="flex-1 overflow-auto m-0">
              {/* Selection info like demo */}
              <div className="p-3 border-b bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500">Selection</span>
                  <select className="text-xs border rounded px-2 py-1">
                    <option>- State -</option>
                    <option>:hover</option>
                    <option>:active</option>
                    <option>:focus</option>
                  </select>
                </div>

                {/* Class tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400">
                    <path
                      fill="currentColor"
                      d="M5.5 7A1.5 1.5 0 0 1 4 5.5 1.5 1.5 0 0 1 5.5 4 1.5 1.5 0 0 1 7 5.5 1.5 1.5 0 0 1 5.5 7m15.91 4.58l-9-9C12.05 2.22 11.55 2 11 2H4a2 2 0 0 0-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42"
                    />
                  </svg>
                  <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent">
                    <Plus className="h-3 w-3" />
                  </Button>
                  {selectedComponent && (
                    <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded">
                      {selectedComponent.toLowerCase().replace(/\s+/g, "-")}
                    </span>
                  )}
                </div>

                {/* Component badge */}
                {selectedComponent && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="bg-violet-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-3 w-3">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
                      </svg>
                      {selectedComponent}
                    </div>
                  </div>
                )}
              </div>

              {/* Selector manager */}
              <div id="selector-container" />

              {/* Style manager sectors */}
              <div id="styles-container" className="flex-1" />
            </TabsContent>

            <TabsContent value="properties" className="flex-1 overflow-auto m-0">
              {/* Selected element info */}
              {selectedComponent && (
                <div className="p-3 border-b">
                  <span className="text-xs font-medium text-slate-500">Selected Element</span>
                  <div className="mt-1 text-sm font-medium">{selectedComponent}</div>
                </div>
              )}

              {/* Traits container */}
              <div id="traits-container" className="p-3" />

              {/* Page Settings */}
              <div className="border-t p-4 mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500">
                    <path
                      fill="currentColor"
                      d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Page Settings</span>
                </div>

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
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-sm">Published</Label>
                    <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx global>{`
        /* Base theme */
        .gjs-one-bg { background-color: #ffffff !important; }
        .gjs-two-color { color: #334155 !important; }
        .gjs-three-bg { background-color: #f1f5f9 !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #7c3aed !important; }
        
        /* Blocks grid - matching demo */
        .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          padding: 0 8px 8px !important;
        }
        
        .gjs-block {
          width: 100% !important;
          min-height: 70px !important;
          margin: 0 !important;
          padding: 12px 8px !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          background: white !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: grab !important;
          transition: all 0.15s !important;
        }
        
        .gjs-block:hover {
          border-color: #7c3aed !important;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15) !important;
        }
        
        .gjs-block svg {
          width: 24px !important;
          height: 24px !important;
          margin-bottom: 6px !important;
          color: #64748b !important;
        }
        
        .gjs-block-label {
          font-size: 11px !important;
          font-weight: 500 !important;
          color: #64748b !important;
          text-align: center !important;
        }

        /* Block categories */
        .gjs-block-category {
          border: none !important;
        }
        
        .gjs-block-category .gjs-title {
          background: transparent !important;
          border: none !important;
          padding: 12px 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #94a3b8 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        /* Layers */
        .gjs-layers { background: transparent !important; }
        
        .gjs-layer {
          background: transparent !important;
          font-size: 12px !important;
        }
        
        .gjs-layer-title {
          padding: 8px 12px !important;
          border-radius: 4px !important;
          margin: 1px 4px !important;
        }
        
        .gjs-layer-title:hover { background: #f1f5f9 !important; }
        
        .gjs-layer.gjs-selected > .gjs-layer-title {
          background: #7c3aed !important;
          color: white !important;
        }

        .gjs-layer-children { padding-left: 12px !important; }
        
        .gjs-layer-vis, .gjs-layer-caret {
          width: 18px !important;
          fill: #94a3b8 !important;
        }
        
        .gjs-layer.gjs-selected .gjs-layer-vis,
        .gjs-layer.gjs-selected .gjs-layer-caret {
          fill: white !important;
        }

        /* Style Manager sectors - with indicator dots like demo */
        .gjs-sm-sector {
          border: none !important;
          margin-bottom: 2px !important;
        }
        
        .gjs-sm-sector-title {
          padding: 10px 12px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #1e293b !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        
        .gjs-sm-sector-title:hover { background: #f8fafc !important; }
        
        .gjs-sm-sector.gjs-sm-open .gjs-sm-sector-title {
          border-radius: 6px 6px 0 0 !important;
          border-bottom: none !important;
        }
        
        /* Add colored indicator dot to sector titles */
        .gjs-sm-sector-title::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          background: transparent;
        }
        
        .gjs-sm-sector.gjs-sm-open .gjs-sm-sector-title::before {
          background: #22c55e;
        }
        
        .gjs-sm-properties {
          padding: 12px !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
        }
        
        .gjs-sm-property { margin-bottom: 12px !important; }
        
        .gjs-sm-label {
          font-size: 11px !important;
          color: #64748b !important;
          font-weight: 500 !important;
          margin-bottom: 4px !important;
        }
        
        /* Fields */
        .gjs-field {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
        }
        
        .gjs-field:focus-within {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
        }
        
        .gjs-field input, .gjs-field select {
          background: transparent !important;
          color: #334155 !important;
          font-size: 12px !important;
          padding: 6px 8px !important;
        }

        /* Selector manager */
        .gjs-clm-tags {
          padding: 0 !important;
          min-height: auto !important;
        }
        
        .gjs-clm-tag {
          background: #7c3aed !important;
          color: white !important;
          border-radius: 4px !important;
          padding: 4px 10px !important;
          font-size: 11px !important;
          margin: 2px !important;
        }

        /* Canvas */
        .gjs-cv-canvas { background: #f1f5f9 !important; }
        
        .gjs-frame-wrapper {
          background: white !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
          border-radius: 8px !important;
          margin: 20px !important;
        }

        /* Selected highlight */
        .gjs-selected { outline: 2px solid #7c3aed !important; outline-offset: -2px; }
        
        /* Hover highlight */
        .gjs-hovered { outline: 1px dashed #7c3aed !important; }

        /* Floating toolbar like demo */
        .gjs-toolbar {
          background: #1e293b !important;
          border-radius: 8px !important;
          padding: 4px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          display: flex !important;
          gap: 2px !important;
        }
        
        .gjs-toolbar-item {
          padding: 6px 8px !important;
          border-radius: 4px !important;
          color: white !important;
          cursor: pointer !important;
        }
        
        .gjs-toolbar-item:hover { background: rgba(255, 255, 255, 0.1) !important; }
        
        /* Component badge */
        .gjs-badge {
          background: #7c3aed !important;
          color: white !important;
          font-size: 10px !important;
          padding: 3px 8px !important;
          border-radius: 4px !important;
          font-weight: 500 !important;
        }

        /* Spacing handles - the colored margin/padding indicators */
        .gjs-margin-v-el, .gjs-padding-v-el {
          opacity: 0.6 !important;
          transition: opacity 0.15s !important;
        }
        
        .gjs-margin-v-el:hover, .gjs-padding-v-el:hover {
          opacity: 1 !important;
        }
        
        .gjs-margin-v-el { background: rgba(255, 193, 7, 0.3) !important; }
        .gjs-padding-v-el { background: rgba(34, 197, 94, 0.3) !important; }

        /* Resizer handlers */
        .gjs-resizer-h {
          background: #7c3aed !important;
          border-radius: 4px !important;
        }

        /* RTE toolbar */
        .gjs-rte-toolbar {
          background: #1e293b !important;
          border-radius: 8px !important;
          padding: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        
        .gjs-rte-action {
          color: white !important;
          padding: 6px !important;
          border-radius: 4px !important;
        }
        
        .gjs-rte-action:hover { background: rgba(255, 255, 255, 0.1) !important; }
        .gjs-rte-active { background: #7c3aed !important; }

        /* Traits */
        .gjs-trt-traits { padding: 0 !important; }
        
        .gjs-trt-trait {
          padding: 8px 0 !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        
        .gjs-trt-trait .gjs-label {
          font-size: 11px !important;
          color: #64748b !important;
          font-weight: 500 !important;
        }

        /* Modal */
        .gjs-mdl-dialog {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        
        .gjs-mdl-header {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 16px 20px !important;
        }
        
        .gjs-mdl-title {
          font-weight: 600 !important;
          color: #1e293b !important;
        }
        
        .gjs-mdl-btn-close { color: #64748b !important; }

        /* Hide default GrapesJS panels - we use our own */
        .gjs-pn-panels { display: none !important; }
      `}</style>
    </div>
  )
}

export { GrapesJSPageEditor }
export default GrapesJSPageEditor
