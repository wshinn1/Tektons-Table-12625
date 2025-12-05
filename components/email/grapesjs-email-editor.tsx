"use client"

import { useRef, useState, useEffect } from "react"
import type { Editor } from "grapesjs"
import GjsEditor from "@grapesjs/react"
import { Button } from "@/components/ui/button"
import { Eye, Code, Monitor, Smartphone, Save } from "lucide-react"

import grapesjs from "grapesjs"
import "grapesjs/dist/css/grapes.min.css"

interface GrapesJSEmailEditorProps {
  initialContent?: string
  initialHtml?: string
  initialJson?: any
  onSave?: (html: string, json: string) => void
}

const EMAIL_TEMPLATES = {
  blank: {
    name: "Blank",
    html: "",
  },
  announcement: {
    name: "Announcement",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #2563eb; padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Important Announcement</h1>
        </div>
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Share your exciting news with your supporters here. This template is perfect for ministry updates, event announcements, and important communications.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Learn More</a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280;">
          <p style="margin: 0;">© 2025 Your Ministry. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  newsletter: {
    name: "Newsletter",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="padding: 40px 20px; text-align: center; border-bottom: 3px solid #2563eb;">
          <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Monthly Update</h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Your monthly newsletter from the field</p>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">What's New</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            Share your latest ministry updates, stories, and prayer requests with your faithful supporters.
          </p>
          <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #2563eb; margin: 24px 0;">
            <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 12px 0;">Prayer Request</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
              Please pray for upcoming ministry activities and specific needs on the field.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Support Our Mission</a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 30px 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">Thank you for your faithful support!</p>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2025 Your Ministry. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  update: {
    name: "Ministry Update",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 50px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0 0 12px 0; font-size: 32px;">Ministry Update</h1>
          <p style="color: #dbeafe; margin: 0; font-size: 16px;">Serving with joy on the field</p>
        </div>
        <div style="padding: 40px 20px;">
          <img src="/ministry-team-photo.jpg" alt="Ministry" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Recent Highlights</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 24px 0;">
            We're excited to share what God has been doing through your partnership. Here are some recent highlights from our ministry...
          </p>
          <div style="display: grid; gap: 16px; margin: 24px 0;">
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px;">
              <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 8px 0;">✓ Community Outreach</h3>
              <p style="font-size: 14px; color: #374151; margin: 0;">Connected with over 100 families this month</p>
            </div>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px;">
              <h3 style="color: #166534; font-size: 18px; margin: 0 0 8px 0;">✓ Lives Changed</h3>
              <p style="font-size: 14px; color: #374151; margin: 0;">Witnessed incredible transformation stories</p>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Give Today</a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 24px 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">Blessings from the field,</p>
          <p style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">Your Ministry Team</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Your Ministry. All rights reserved.</p>
        </div>
      </div>
    `,
  },
}

export function GrapesJSEmailEditor({ initialContent, initialHtml, initialJson, onSave }: GrapesJSEmailEditorProps) {
  const editorRef = useRef<Editor | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  const [newsletterPlugin, setNewsletterPlugin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        console.log("[v0] Loading newsletter plugin...")
        const pluginModule = await import("grapesjs-preset-newsletter")
        const plugin = pluginModule.default || pluginModule
        console.log("[v0] Newsletter plugin loaded successfully")
        setNewsletterPlugin(() => plugin)
      } catch (error) {
        console.error("[v0] Failed to load newsletter plugin:", error)
        // Still allow editor to load without the plugin
      } finally {
        setIsLoading(false)
      }
    }

    loadPlugin()
  }, [])

  const onEditor = (editor: Editor) => {
    console.log("[v0] GrapeJS Editor initialized")
    editorRef.current = editor

    editor.on("asset:upload:start", () => {
      console.log("[v0] Starting image upload")
    })

    editor.on("asset:upload:response", (response: any) => {
      console.log("[v0] Upload response:", response)
      if (response && response.url) {
        const asset = editor.AssetManager.add({
          src: response.url,
          name: response.filename || "Uploaded Image",
          type: "image",
        })

        // Immediately select the uploaded image
        const assetManager = editor.AssetManager
        assetManager.select(asset, true)

        // Insert into the selected image component
        const target = editor.getSelected()
        if (target && target.is("image")) {
          target.set("src", response.url)
        }

        setTimeout(() => {
          const modal = editor.Modal
          if (modal && modal.isOpen && modal.isOpen()) {
            modal.close()
            console.log("[v0] Image modal closed after upload")
          }
        }, 500)
      }
    })

    editor.on("asset:upload:error", (error: any) => {
      console.error("[v0] Upload error:", error)
    })

    editor.on("asset:upload:end", () => {
      console.log("[v0] Image upload complete")
    })

    editor.on("asset:add", (asset: any) => {
      // When user clicks on an already-uploaded asset, close the modal
      const target = editor.getSelected()
      if (target && target.is("image") && asset && asset.get("src")) {
        target.set("src", asset.get("src"))
        setTimeout(() => {
          const modal = editor.Modal
          if (modal && modal.isOpen && modal.isOpen()) {
            modal.close()
          }
        }, 200)
      }
    })

    editor.on("asset:select", (asset: any) => {
      const target = editor.getSelected()
      if (target && target.is("image") && asset && asset.get("src")) {
        target.set("src", asset.get("src"))
        setTimeout(() => {
          const modal = editor.Modal
          if (modal && modal.isOpen && modal.isOpen()) {
            modal.close()
            console.log("[v0] Image modal closed after selection")
          }
        }, 100)
      }
    })

    let saveTimeout: NodeJS.Timeout | null = null
    const handleContentChange = () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        if (!editor || !editor.getHtml || !editor.getCss || !editor.getProjectData) {
          console.log("[v0] Editor not fully initialized yet, skipping save")
          return
        }

        try {
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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  ${html}
</body>
</html>
        `.trim()

          const textOnly = html.replace(/<[^>]*>/g, "").trim()
          console.log("[v0] Auto-saving - text length:", textOnly.length)
          onSave?.(fullHtml, json)
        } catch (error) {
          console.error("[v0] Error during auto-save:", error)
        }
      }, 300) // Reduced debounce from 500ms to 300ms
    }

    editor.on("component:add", handleContentChange)
    editor.on("component:remove", handleContentChange)
    editor.on("component:update", handleContentChange)
    editor.on("component:input", handleContentChange)
    editor.on("update", handleContentChange)

    const contentToLoad = initialContent || initialHtml
    if (contentToLoad) {
      try {
        const parsed = JSON.parse(contentToLoad)
        editor.loadProjectData(parsed)
      } catch {
        editor.setComponents(contentToLoad)
      }
    } else if (initialJson) {
      try {
        if (typeof initialJson === "string") {
          editor.loadProjectData(JSON.parse(initialJson))
        } else {
          editor.loadProjectData(initialJson)
        }
      } catch (error) {
        console.error("[v0] Failed to load initial JSON:", error)
      }
    }
  }

  const handleSave = async () => {
    if (!editorRef.current) return

    setIsSaving(true)
    try {
      const editor = editorRef.current

      if (!editor.getHtml || !editor.getCss || !editor.getProjectData) {
        console.error("[v0] Editor methods not available")
        return
      }

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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  ${html}
</body>
</html>
      `.trim()

      console.log("[v0] Saving email template")
      await onSave?.(fullHtml, json)
    } catch (error) {
      console.error("[v0] Error saving:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreview = () => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const command = "preview"

    if (isPreview) {
      editor.stopCommand(command)
    } else {
      editor.runCommand(command)
    }

    setIsPreview(!isPreview)
  }

  const toggleCode = () => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const command = "export-template"

    if (showCode) {
      editor.stopCommand(command)
    } else {
      editor.runCommand(command)
    }

    setShowCode(!showCode)
  }

  const changeDevice = (newDevice: "desktop" | "mobile") => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const canvas = editor.Canvas
    const deviceManager = editor.Devices

    // Get the device object
    const deviceObj = deviceManager.get(newDevice)

    if (deviceObj) {
      // Set the device which updates the canvas width
      deviceManager.select(newDevice)

      // Force canvas refresh to apply the new width
      const frame = canvas.getFrameEl()
      if (frame) {
        const width = deviceObj.get("width") || "100%"
        frame.style.width = width
        frame.style.transition = "width 0.3s ease"
        console.log("[v0] Canvas width set to:", width, "for device:", newDevice)
      }

      setDevice(newDevice)
      console.log("[v0] Device changed to:", newDevice)
    } else {
      console.error("[v0] Device not found:", newDevice)
    }
  }

  const loadTemplate = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    if (!editorRef.current) return

    const template = EMAIL_TEMPLATES[templateKey]
    editorRef.current.setComponents(template.html)
    console.log("[v0] Loaded template:", template.name)
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading email editor...</p>
        </div>
      </div>
    )
  }

  const plugins = newsletterPlugin ? [newsletterPlugin] : []

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded px-2 py-1 bg-background"
            onChange={(e) => loadTemplate(e.target.value as keyof typeof EMAIL_TEMPLATES)}
            defaultValue="blank"
          >
            <option value="blank">Choose Template...</option>
            {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            variant={device === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeDevice("desktop")}
            className={device === "desktop" ? "bg-primary text-primary-foreground" : ""}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={device === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => changeDevice("mobile")}
            className={device === "mobile" ? "bg-primary text-primary-foreground" : ""}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={isPreview ? "default" : "outline"} size="sm" onClick={togglePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant={showCode ? "default" : "outline"} size="sm" onClick={toggleCode}>
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button onClick={handleSave} size="sm" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white" style={{ height: "700px" }}>
        <GjsEditor
          grapesjs={grapesjs}
          options={{
            height: "100%",
            width: "100%",
            storageManager: false,
            panels: {
              defaults: [],
            },
            blockManager: {
              appendTo: undefined,
            },
            styleManager: {
              appendTo: undefined,
            },
            layerManager: {
              appendTo: undefined,
            },
            traitManager: {
              appendTo: undefined,
            },
            selectorManager: {
              appendTo: undefined,
            },
            assetManager: {
              upload: "/api/blob/upload-image",
              uploadName: "file",
              multiUpload: false,
              autoAdd: false,
              params: {},
              headers: {},
            },
            plugins: plugins,
            pluginsOpts: newsletterPlugin
              ? {
                  "gjs-preset-newsletter": {
                    modalTitleImport: "Import template",
                    codeViewerTheme: "material",
                    showBlocksOnLoad: true,
                    blocks: [
                      "sect100",
                      "sect50",
                      "sect30",
                      "sect37",
                      "button",
                      "divider",
                      "text",
                      "image",
                      "quote",
                      "link",
                      "link-block",
                      "text-sect",
                    ],
                    blocksBasicOpts: {
                      flexGrid: 1,
                    },
                    styleManagerOpts: {
                      sectors: [
                        {
                          name: "General",
                          open: true,
                          buildProps: ["float", "display", "position", "top", "right", "left", "bottom"],
                        },
                        {
                          name: "Dimension",
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
                            "text-shadow",
                          ],
                        },
                        {
                          name: "Decorations",
                          open: false,
                          buildProps: ["border-radius", "border", "background", "box-shadow"],
                        },
                      ],
                    },
                  },
                }
              : {},
            canvas: {
              styles: ["https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"],
            },
          }}
          onEditor={onEditor}
        />
      </div>
    </div>
  )
}
