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
  Layers,
  Settings,
  Palette,
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

  // Page metadata
  const [title, setTitle] = useState(page?.title || "")
  const [slug, setSlug] = useState(page?.slug || "")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [activePanel, setActivePanel] = useState<"blocks" | "layers" | "styles" | "settings">("blocks")

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
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    )
  }

  const plugins = [webpagePlugin, blocksBasicPlugin, formsPlugin].filter(Boolean)

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/${tenantSlug}/admin/pages`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button variant="ghost" size="icon" onClick={handleUndo} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border" />

          <select
            className="text-sm border rounded px-2 py-1.5 bg-background"
            onChange={(e) => loadTemplate(e.target.value as keyof typeof PAGE_TEMPLATES)}
            defaultValue=""
          >
            <option value="" disabled>
              Load Template...
            </option>
            {Object.entries(PAGE_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => changeDevice("desktop")}
              className="rounded-r-none"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "tablet" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => changeDevice("tablet")}
              className="rounded-none border-x"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => changeDevice("mobile")}
              className="rounded-l-none"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border" />

          <Button variant={isPreview ? "secondary" : "ghost"} size="sm" onClick={togglePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant={showCode ? "secondary" : "ghost"} size="sm" onClick={toggleCode}>
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button onClick={handleSave} size="sm" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Panel Selector */}
        <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-2 gap-1">
          <Button
            variant={activePanel === "blocks" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setActivePanel("blocks")}
            title="Blocks"
          >
            <Layers className="h-4 w-4" />
          </Button>
          <Button
            variant={activePanel === "styles" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setActivePanel("styles")}
            title="Styles"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant={activePanel === "settings" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setActivePanel("settings")}
            title="Page Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Left Panel Content */}
        <div className="w-64 border-r bg-background overflow-y-auto">
          {activePanel === "settings" && (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Page Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-xs">
                    Page Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Page"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug" className="text-xs">
                    URL Slug
                  </Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    placeholder="my-page"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    /{tenantSlug}/p/{slug || "my-page"}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="published" className="text-sm">
                    Published
                  </Label>
                  <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>
            </div>
          )}
          {activePanel === "blocks" && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground p-2">Drag blocks to the canvas</p>
              <div id="blocks-container" />
            </div>
          )}
          {activePanel === "styles" && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground p-2">Select an element to edit styles</p>
              <div id="styles-container" />
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 overflow-hidden bg-gray-100">
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
                    name: "Dimension",
                    open: true,
                    buildProps: ["width", "min-height", "padding", "margin"],
                  },
                  {
                    name: "Typography",
                    open: false,
                    buildProps: ["font-family", "font-size", "font-weight", "color", "text-align", "line-height"],
                  },
                  {
                    name: "Background",
                    open: false,
                    buildProps: ["background-color", "background"],
                  },
                  {
                    name: "Border",
                    open: false,
                    buildProps: ["border-radius", "border"],
                  },
                ],
              },
              layerManager: {
                appendTo: "#layers-container",
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

        {/* Right Sidebar - Traits/Properties */}
        <div className="w-64 border-l bg-background overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Element Properties</h3>
            <div id="traits-container" />
            <p className="text-xs text-muted-foreground">Select an element to edit its properties</p>
          </div>
        </div>
      </div>
    </div>
  )
}
