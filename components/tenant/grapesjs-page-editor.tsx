"use client"

import { useRef, useState, useEffect } from "react"
import type { Editor } from "grapesjs"
import GjsEditor from "@grapesjs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Eye,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  ArrowLeft,
  Undo,
  Redo,
  Maximize,
  Layers,
  Layout,
  Settings,
  ChevronDown,
  ChevronRight,
  Tag,
  Plus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createTenantPage, updateTenantPage } from "@/app/actions/tenant-pages"

import grapesjs from "grapesjs"
import "grapesjs/dist/css/grapes.min.css"

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
          <p style="text-align: center; color: #6b7280; font-size: 18px; max-width: 600px; margin: 0 auto 60px auto;">We're dedicated to serving communities and spreading hope through practical ministry and compassionate outreach.</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
            <div style="text-align: center; padding: 40px 24px; background: #f9fafb; border-radius: 12px;">
              <div style="width: 64px; height: 64px; background: #667eea; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">❤</div>
              <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Community Support</h3>
              <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">Providing resources and support to families in need.</p>
            </div>
            <div style="text-align: center; padding: 40px 24px; background: #f9fafb; border-radius: 12px;">
              <div style="width: 64px; height: 64px; background: #667eea; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">✦</div>
              <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Youth Programs</h3>
              <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">Empowering the next generation through mentorship.</p>
            </div>
            <div style="text-align: center; padding: 40px 24px; background: #f9fafb; border-radius: 12px;">
              <div style="width: 64px; height: 64px; background: #667eea; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">★</div>
              <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Global Outreach</h3>
              <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.6;">Extending our mission to communities worldwide.</p>
            </div>
          </div>
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
      <section style="padding: 80px 20px; background: white;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">Our Story</h2>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.8; margin: 0 0 24px 0;">
            Founded with a heart for service, our ministry began as a small group of dedicated individuals who saw a need in their community and decided to take action.
          </p>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.8; margin: 0 0 40px 0;">
            Over the years, we've grown into a thriving community of volunteers, supporters, and partners who share our vision of making a lasting impact in the lives of those we serve.
          </p>
          <img src="/ministry-team-working-together.jpg" alt="Our Team" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 40px;">
          <h2 style="font-size: 32px; font-weight: 700; color: #1f2937; margin: 0 0 24px 0;">Our Values</h2>
          <ul style="color: #4b5563; font-size: 18px; line-height: 2; padding-left: 24px;">
            <li><strong>Faith:</strong> Everything we do is rooted in our faith and trust in God's provision.</li>
            <li><strong>Compassion:</strong> We approach every person with love and understanding.</li>
            <li><strong>Integrity:</strong> We operate with transparency and accountability.</li>
            <li><strong>Excellence:</strong> We strive to do our best in all that we do.</li>
          </ul>
        </div>
      </section>
    `,
  },
  contact: {
    name: "Contact Page",
    html: `
      <section style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 80px 20px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 16px 0;">Contact Us</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">We'd love to hear from you</p>
        </div>
      </section>
      <section style="padding: 80px 20px; background: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 48px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <form>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Name</label>
              <input type="text" placeholder="Your name" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Email</label>
              <input type="email" placeholder="your@email.com" style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">Message</label>
              <textarea rows="5" placeholder="Your message..." style="width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
            <button type="submit" style="width: 100%; background: #3b82f6; color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Send Message</button>
          </form>
        </div>
      </section>
      <section style="padding: 60px 20px; background: white;">
        <div style="max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; text-align: center;">
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Email</h3>
            <p style="color: #6b7280; margin: 0;">hello@example.com</p>
          </div>
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Phone</h3>
            <p style="color: #6b7280; margin: 0;">(555) 123-4567</p>
          </div>
          <div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 8px 0;">Location</h3>
            <p style="color: #6b7280; margin: 0;">City, State</p>
          </div>
        </div>
      </section>
    `,
  },
  gallery: {
    name: "Gallery Page",
    html: `
      <section style="background: #111827; padding: 80px 20px;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h1 style="color: white; font-size: 48px; font-weight: 700; margin: 0 0 16px 0;">Photo Gallery</h1>
          <p style="color: #9ca3af; font-size: 18px; margin: 0;">Moments from our ministry</p>
        </div>
      </section>
      <section style="padding: 60px 20px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          <img src="/ministry-community-event.jpg" alt="Gallery 1" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
          <img src="/volunteer-team-helping.jpg" alt="Gallery 2" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
          <img src="/church-gathering-worship.jpg" alt="Gallery 3" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
          <img src="/youth-program-activities.jpg" alt="Gallery 4" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
          <img src="/community-outreach-food.jpg" alt="Gallery 5" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
          <img src="/mission-trip-international.jpg" alt="Gallery 6" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px;">
        </div>
      </section>
    `,
  },
}

export function GrapesJSPageEditor({ tenantId, tenantSlug, page }: GrapesJSPageEditorProps) {
  const router = useRouter()
  const editorRef = useRef<Editor | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [webpagePlugin, setWebpagePlugin] = useState<any>(null)
  const [blocksBasicPlugin, setBlocksBasicPlugin] = useState<any>(null)
  const [formsPlugin, setFormsPlugin] = useState<any>(null)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [rightTab, setRightTab] = useState<"styles" | "settings">("styles")
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [selectedComponentName, setSelectedComponentName] = useState<string>("")

  // Page metadata
  const [title, setTitle] = useState(page?.title || "")
  const [slug, setSlug] = useState(page?.slug || "")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const [webpageModule, blocksModule, formsModule] = await Promise.all([
          import("grapesjs-preset-webpage"),
          import("grapesjs-blocks-basic"),
          import("grapesjs-plugin-forms"),
        ])

        setWebpagePlugin(() => webpageModule.default || webpageModule)
        setBlocksBasicPlugin(() => blocksModule.default || blocksModule)
        setFormsPlugin(() => formsModule.default || formsModule)
      } catch (error) {
        console.error("Failed to load GrapesJS plugins:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlugins()
  }, [])

  const onEditor = (editor: Editor) => {
    editorRef.current = editor

    editor.on("load", () => {
      const style = document.createElement("style")
      style.innerHTML = `
        /* Main background colors - lighter like demo */
        .gjs-one-bg { background-color: #f5f5f5 !important; }
        .gjs-two-color { color: #444 !important; }
        .gjs-three-bg { background-color: #fff !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #7c3aed !important; }
        
        /* Panel buttons */
        .gjs-pn-btn { color: #666 !important; }
        .gjs-pn-btn:hover { color: #7c3aed !important; }
        .gjs-pn-btn.gjs-pn-active { color: #7c3aed !important; }
        
        /* Blocks styling */
        .gjs-block { 
          background-color: #fff !important; 
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          min-height: 70px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          transition: all 0.15s ease !important;
        }
        .gjs-block:hover { 
          border-color: #7c3aed !important;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15) !important;
          transform: translateY(-1px) !important;
        }
        .gjs-block-label {
          color: #444 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
        }
        .gjs-block svg {
          fill: #666 !important;
        }
        .gjs-block:hover svg {
          fill: #7c3aed !important;
        }
        
        /* Blocks container grid */
        .gjs-blocks-c {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          padding: 12px !important;
          background: #fafafa !important;
        }
        
        /* Category titles */
        .gjs-block-category .gjs-title {
          background-color: #fff !important;
          color: #333 !important;
          border-bottom: 1px solid #e5e5e5 !important;
          padding: 12px 14px !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .gjs-block-category .gjs-title:hover {
          background-color: #f9f9f9 !important;
        }
        
        /* Style Manager sectors - collapsible with indicators */
        .gjs-sm-sector {
          border-bottom: 1px solid #e5e5e5 !important;
          background: #fff !important;
        }
        .gjs-sm-sector-title {
          background-color: #fff !important;
          color: #333 !important;
          border: none !important;
          padding: 12px 14px !important;
          font-weight: 500 !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          cursor: pointer !important;
        }
        .gjs-sm-sector-title:hover {
          background-color: #f9f9f9 !important;
        }
        
        /* Active sector indicator (green dot like demo) */
        .gjs-sm-sector.gjs-sm-open .gjs-sm-sector-title::after {
          content: '';
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          margin-left: auto;
        }
        
        /* Form fields */
        .gjs-field {
          background-color: #fff !important;
          border: 1px solid #e5e5e5 !important;
          color: #333 !important;
          border-radius: 6px !important;
        }
        .gjs-field:focus-within {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1) !important;
        }
        .gjs-field input, .gjs-field select {
          color: #333 !important;
        }
        
        /* Selector/Class manager */
        .gjs-clm-tags {
          background-color: #fff !important;
          padding: 10px !important;
          border-radius: 6px !important;
          border: 1px solid #e5e5e5 !important;
        }
        #gjs-clm-tags-field {
          color: #333 !important;
        }
        .gjs-clm-tag {
          background-color: #7c3aed !important;
          color: white !important;
          border-radius: 4px !important;
          padding: 2px 8px !important;
          font-size: 11px !important;
        }
        .gjs-clm-tag-close {
          color: white !important;
        }
        
        /* Style properties container */
        .gjs-sm-properties {
          background-color: #fafafa !important;
          padding: 12px !important;
        }
        
        /* Layer manager */
        .gjs-layers {
          background: #fff !important;
        }
        .gjs-layer {
          background-color: #fff !important;
          border-radius: 4px !important;
          margin: 2px 6px !important;
          border: 1px solid #e5e5e5 !important;
        }
        .gjs-layer:hover {
          background-color: #f5f5f5 !important;
          border-color: #d5d5d5 !important;
        }
        .gjs-layer.gjs-selected {
          background-color: #f0e7ff !important;
          border-color: #7c3aed !important;
        }
        .gjs-layer-name {
          color: #333 !important;
        }
        .gjs-layer.gjs-selected .gjs-layer-name {
          color: #7c3aed !important;
          font-weight: 500 !important;
        }
        
        /* Trait manager (properties) */
        .gjs-trt-traits {
          padding: 12px !important;
          background: #fafafa !important;
        }
        .gjs-trt-trait {
          padding: 8px 0 !important;
          border-bottom: 1px solid #e5e5e5 !important;
        }
        .gjs-trt-trait:last-child {
          border-bottom: none !important;
        }
        .gjs-trt-trait__wrp-title {
          color: #666 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.3px !important;
          margin-bottom: 4px !important;
        }
        
        /* Canvas area */
        .gjs-cv-canvas {
          background-color: #e5e5e5 !important;
        }
        .gjs-frame-wrapper {
          background: white !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
          border-radius: 4px !important;
        }
        
        /* Radio buttons (display options) */
        .gjs-radio-item input:checked + .gjs-radio-item-label {
          background-color: #7c3aed !important;
          color: white !important;
        }
        .gjs-radio-item-label {
          border-radius: 4px !important;
        }
        
        /* Selection highlight */
        .gjs-selected {
          outline: 2px solid #7c3aed !important;
          outline-offset: -2px !important;
        }
        
        /* Toolbar on selected component */
        .gjs-toolbar {
          background: #7c3aed !important;
          border-radius: 4px !important;
        }
        .gjs-toolbar-item {
          color: white !important;
        }
        
        /* Resizer */
        .gjs-resizer-h {
          border-color: #7c3aed !important;
        }
        
        /* Label for properties */
        .gjs-sm-label {
          color: #666 !important;
          font-size: 11px !important;
        }
        
        /* Property icons */
        .gjs-sm-icon {
          color: #999 !important;
        }
      `
      document.head.appendChild(style)
    })

    editor.on("component:selected", (component: any) => {
      setSelectedComponent(component)
      setSelectedComponentName(component?.getName?.() || component?.get?.("tagName") || "Element")
      // Force trait manager update
      editor.TraitManager.select(component)
    })

    editor.on("component:deselected", () => {
      setSelectedComponent(null)
      setSelectedComponentName("")
    })

    // Configure asset manager for image uploads
    editor.on("asset:upload:response", (response: any) => {
      if (response?.url) {
        editor.AssetManager.add({ src: response.url, type: "image" })
        const target = editor.getSelected()
        if (target && target.is("image")) {
          target.set("src", response.url)
        }
        setTimeout(() => {
          const modal = editor.Modal
          if (modal?.isOpen?.()) modal.close()
        }, 500)
      }
    })

    // Load initial content
    if (page?.design_json) {
      try {
        const json = typeof page.design_json === "string" ? JSON.parse(page.design_json) : page.design_json
        editor.loadProjectData(json)
      } catch {
        if (page.content) {
          editor.setComponents(page.content)
        }
      }
    } else if (page?.content) {
      editor.setComponents(page.content)
    }
  }

  const handleSave = async () => {
    if (!editorRef.current) return
    if (!title.trim()) {
      toast.error("Please enter a page title")
      return
    }
    if (!slug.trim()) {
      toast.error("Please enter a page slug")
      return
    }

    setIsSaving(true)
    try {
      const editor = editorRef.current
      const html = editor.getHtml()
      const css = editor.getCss()
      const json = JSON.stringify(editor.getProjectData())

      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>
      `.trim()

      if (page?.id) {
        await updateTenantPage(page.id, {
          title,
          slug,
          content: fullHtml,
          design_json: json,
          is_published: isPublished,
        })
        toast.success("Page updated successfully")
      } else {
        await createTenantPage({
          tenant_id: tenantId,
          title,
          slug,
          content: fullHtml,
          design_json: json,
          is_published: isPublished,
        })
        toast.success("Page created successfully")
        router.push(`/${tenantSlug}/admin/pages`)
      }
    } catch (error) {
      console.error("Error saving page:", error)
      toast.error("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreview = () => {
    if (!editorRef.current) return
    const editor = editorRef.current
    if (isPreview) {
      editor.stopCommand("preview")
    } else {
      editor.runCommand("preview")
    }
    setIsPreview(!isPreview)
  }

  const toggleCode = () => {
    if (!editorRef.current) return
    const editor = editorRef.current
    if (showCode) {
      editor.stopCommand("export-template")
    } else {
      editor.runCommand("export-template")
    }
    setShowCode(!showCode)
  }

  const changeDevice = (newDevice: "desktop" | "tablet" | "mobile") => {
    if (!editorRef.current) return
    editorRef.current.Devices.select(newDevice)
    setDevice(newDevice)
  }

  const handleUndo = () => editorRef.current?.UndoManager.undo()
  const handleRedo = () => editorRef.current?.UndoManager.redo()

  const loadTemplate = (templateKey: keyof typeof PAGE_TEMPLATES) => {
    if (!editorRef.current) return
    const template = PAGE_TEMPLATES[templateKey]
    editorRef.current.setComponents(template.html)
    toast.success(`Loaded "${template.name}" template`)
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent" />
          <p className="mt-4 text-sm text-gray-500">Loading page builder...</p>
        </div>
      </div>
    )
  }

  const plugins = [webpagePlugin, blocksBasicPlugin, formsPlugin].filter(Boolean)

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-800">
      {/* Top Toolbar - Light theme matching demo */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${tenantSlug}/admin/pages`)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="w-px h-5 bg-gray-200" />

          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            title="Undo"
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            title="Redo"
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-gray-200" />

          {/* Template selector */}
          <select
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            onChange={(e) => loadTemplate(e.target.value as keyof typeof PAGE_TEMPLATES)}
            defaultValue=""
          >
            <option value="" disabled>
              Templates
            </option>
            {Object.entries(PAGE_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center - Device selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDevice("desktop")}
            className={`h-8 w-8 rounded ${device === "desktop" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDevice("tablet")}
            className={`h-8 w-8 rounded ${device === "tablet" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeDevice("mobile")}
            className={`h-8 w-8 rounded ${device === "mobile" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editorRef.current?.runCommand("core:fullscreen")}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCode}
            className={`h-8 w-8 ${showCode ? "bg-violet-100 text-violet-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
            title="View Code"
          >
            <Code className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={togglePreview}
            className={`h-8 w-8 ${isPreview ? "bg-violet-100 text-violet-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-gray-200" />

          <Button
            onClick={handleSave}
            size="sm"
            disabled={isSaving}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pages and Layers like demo */}
        {leftPanelOpen && (
          <div className="w-72 flex flex-col bg-white border-r border-gray-200">
            {/* Pages section header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Pages</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Plus className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Current page */}
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-violet-50 rounded text-violet-700 text-sm">
                <span className="truncate">{title || "Untitled Page"}</span>
              </div>
            </div>

            {/* Layers section */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
                <Layers className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Layers</span>
              </div>
              <div id="layers-container" className="flex-1 overflow-y-auto" />
            </div>
          </div>
        )}

        {/* Left panel toggle */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-r-md p-1 hover:bg-gray-50 shadow-sm"
          style={{ left: leftPanelOpen ? "288px" : "0" }}
        >
          {leftPanelOpen ? (
            <ChevronRight className="h-4 w-4 text-gray-400 rotate-180" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden bg-gray-200 relative">
          {/* Removed canvas toolbar to simplify, kept it in original code for reference but commented out */}
          {/* <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-[#373d49] rounded-lg p-1 shadow-lg border border-[#444]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editorRef.current?.runCommand("core:canvas-clear")}
              className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-[#404754]"
              title="Clear Canvas"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-[#555]" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#404754]"
              title="Move Up"
            >
              <MoveUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#404754]"
              title="Move Down"
            >
              <MoveDown className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-[#555]" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#404754]"
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div> */}

          <GjsEditor
            grapesjs={grapesjs}
            options={{
              height: "100%",
              width: "100%",
              storageManager: false,
              blockManager: {
                appendTo: "#blocks-container",
              },
              styleManager: {
                appendTo: "#styles-container",
                sectors: [
                  {
                    name: "Layout",
                    open: true,
                    buildProps: ["display", "flex-direction", "justify-content", "align-items", "flex-wrap", "gap"],
                  },
                  {
                    name: "Size",
                    open: false,
                    buildProps: ["width", "min-width", "max-width", "height", "min-height", "max-height"],
                  },
                  {
                    name: "Space",
                    open: false,
                    buildProps: [
                      "padding",
                      "padding-top",
                      "padding-right",
                      "padding-bottom",
                      "padding-left",
                      "margin",
                      "margin-top",
                      "margin-right",
                      "margin-bottom",
                      "margin-left",
                    ],
                  },
                  {
                    name: "Position",
                    open: false,
                    buildProps: ["position", "top", "right", "bottom", "left", "z-index"],
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
                      "text-align",
                      "line-height",
                      "text-decoration",
                      "text-transform",
                    ],
                  },
                  {
                    name: "Background",
                    open: false,
                    buildProps: [
                      "background-color",
                      "background-image",
                      "background-repeat",
                      "background-position",
                      "background-size",
                    ],
                  },
                  {
                    name: "Borders",
                    open: false,
                    buildProps: [
                      "border-radius",
                      "border-top-left-radius",
                      "border-top-right-radius",
                      "border-bottom-left-radius",
                      "border-bottom-right-radius",
                      "border",
                      "border-width",
                      "border-style",
                      "border-color",
                    ],
                  },
                  {
                    name: "Effects",
                    open: false,
                    buildProps: ["opacity", "box-shadow", "transition"],
                  },
                ],
              },
              layerManager: {
                appendTo: "#layers-container",
              },
              traitManager: {
                appendTo: "#traits-container",
              },
              selectorManager: {
                appendTo: "#selectors-container",
              },
              panels: { defaults: [] },
              assetManager: {
                upload: "/api/blob/upload-image",
                uploadName: "file",
                multiUpload: false,
                autoAdd: false,
              },
              deviceManager: {
                devices: [
                  { name: "desktop", width: "" },
                  { name: "tablet", width: "768px", widthMedia: "992px" },
                  { name: "mobile", width: "375px", widthMedia: "480px" },
                ],
              },
              plugins: plugins,
              pluginsOpts: {
                "grapesjs-preset-webpage": {
                  blocksBasicOpts: { flexGrid: true },
                  navbarOpts: false,
                  countdownOpts: false,
                  formsOpts: false,
                },
                "grapesjs-blocks-basic": {
                  flexGrid: true,
                  stylePrefix: "gjs-",
                  blocks: ["column1", "column2", "column3", "column3-7", "text", "link", "image", "video", "map"],
                },
                "grapesjs-plugin-forms": {
                  blocks: ["form", "input", "textarea", "select", "button", "label", "checkbox", "radio"],
                },
              },
              canvas: {
                styles: ["https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"],
              },
            }}
            onEditor={onEditor}
          />
        </div>

        {/* Right panel toggle */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-l-md p-1 hover:bg-gray-50 shadow-sm"
          style={{ right: rightPanelOpen ? "320px" : "0" }}
        >
          {rightPanelOpen ? (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 rotate-180" />
          )}
        </button>

        {/* Right Sidebar - Styles and Properties combined like demo */}
        {rightPanelOpen && (
          <div className="w-80 flex flex-col bg-white border-l border-gray-200">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setRightTab("styles")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  rightTab === "styles"
                    ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Styles
              </button>
              <button
                onClick={() => setRightTab("settings")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  rightTab === "settings"
                    ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50/50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Properties
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === "styles" && (
                <div>
                  {/* Selection info like demo */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Tag className="h-3 w-3" />
                      Selection
                    </div>
                    <div id="selectors-container" />
                  </div>

                  {/* Blocks section - collapsible */}
                  <details className="border-b border-gray-200" open>
                    <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
                      <ChevronDown className="h-4 w-4 text-gray-400 details-chevron" />
                      Blocks
                    </summary>
                    <div id="blocks-container" />
                  </details>

                  {/* Style Manager */}
                  <div id="styles-container" />
                </div>
              )}
              {rightTab === "settings" && (
                <div>
                  {/* Selected component info */}
                  {selectedComponent ? (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="text-xs text-gray-500 mb-1">Selected Element</div>
                      <div className="font-medium text-gray-900">{selectedComponentName}</div>
                    </div>
                  ) : (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-500">Select an element to edit its properties</div>
                    </div>
                  )}

                  {/* Traits/Properties */}
                  <div id="traits-container" className="p-4" />

                  {/* Page Settings */}
                  <div className="border-t border-gray-200">
                    <details open>
                      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
                        <Settings className="h-4 w-4 text-gray-400" />
                        Page Settings
                      </summary>
                      <div className="px-4 pb-4 space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-xs text-gray-500">
                            Page Title
                          </Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My Page"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slug" className="text-xs text-gray-500">
                            URL Slug
                          </Label>
                          <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                            placeholder="my-page"
                            className="mt-1.5"
                          />
                          <p className="text-xs text-gray-400 mt-1.5">
                            /{tenantSlug}/p/{slug || "my-page"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Label htmlFor="published" className="text-sm text-gray-600">
                            Published
                          </Label>
                          <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
