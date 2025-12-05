"use client"

import { useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import type { EditorRef, EmailEditorProps } from "react-email-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Eye, Globe, FileText, Loader2, Settings, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createUnlayerPage, saveUnlayerPage, publishUnlayerPage } from "@/app/actions/pages"

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted/30">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading page builder...</p>
      </div>
    </div>
  ),
})

const UNLAYER_PROJECT_ID = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID

// Platform-specific page templates
const PAGE_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch",
    design: null,
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero section with features and CTA",
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: "Build Your Mission Platform",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "60px 20px 20px",
                      fontSize: "48px",
                      fontWeight: 700,
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center; font-size:18px; color:#666;'>Empower missionaries with professional fundraising tools, donor management, and beautiful websites — all in one platform.</p>",
                      padding: "0 40px 30px",
                    },
                  },
                  {
                    type: "button",
                    values: {
                      text: "Get Started Free",
                      textAlign: "center",
                      padding: "20px",
                      buttonColors: {
                        color: "#ffffff",
                        backgroundColor: "#1e3a8a",
                      },
                      borderRadius: "8px",
                    },
                  },
                ],
              },
            ],
          },
          {
            cells: [1, 1, 1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Easy Setup", headingType: "h3", textAlign: "center", padding: "40px 20px 10px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Get your fundraising page live in minutes, not days.</p>",
                      padding: "0 20px 40px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: "Donor Management",
                      headingType: "h3",
                      textAlign: "center",
                      padding: "40px 20px 10px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Track donations and build lasting relationships.</p>",
                      padding: "0 20px 40px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Zero Fees", headingType: "h3", textAlign: "center", padding: "40px 20px 10px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>No monthly fees — ever. Only payment processing costs.</p>",
                      padding: "0 20px 40px",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "about",
    name: "About Page",
    description: "Tell your story with text and images",
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: "About Us",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "50px 20px 20px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center; max-width:700px; margin:0 auto;'>We're on a mission to help missionaries focus on what matters most — their calling.</p>",
                      padding: "0 20px 40px",
                    },
                  },
                ],
              },
            ],
          },
          {
            cells: [1, 1],
            columns: [
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: { url: "/collaborative-teamwork.png" },
                      textAlign: "center",
                      padding: "20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Our Story", headingType: "h2", padding: "20px 20px 10px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Share your organization's story here. Tell visitors who you are, what you do, and why it matters.</p><p>This is your chance to connect with your audience on a personal level and share your journey, mission, and vision.</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Contact information and details",
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: "Get In Touch",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "50px 20px 10px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>We'd love to hear from you. Reach out with questions or to learn more.</p>",
                      padding: "10px 40px 40px",
                    },
                  },
                ],
              },
            ],
          },
          {
            cells: [1, 1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Contact Information", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p><strong>Email:</strong> support@tektonstable.com</p><p><strong>Phone:</strong> (555) 123-4567</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Office Hours", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Monday - Friday: 9am - 5pm EST</p><p>Weekend: Closed</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "features",
    name: "Features Page",
    description: "Showcase platform features",
    design: {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: "Platform Features",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "50px 20px 20px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Everything you need to run your missionary support platform.</p>",
                      padding: "0 40px 40px",
                    },
                  },
                ],
              },
            ],
          },
          {
            cells: [1, 1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Feature One", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Describe your first feature here with compelling details about its benefits.</p>",
                      padding: "0 20px 30px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Feature Two", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Describe your second feature here with compelling details about its benefits.</p>",
                      padding: "0 20px 30px",
                    },
                  },
                ],
              },
            ],
          },
          {
            cells: [1, 1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Feature Three", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Describe your third feature here with compelling details about its benefits.</p>",
                      padding: "0 20px 30px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Feature Four", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Describe your fourth feature here with compelling details about its benefits.</p>",
                      padding: "0 20px 30px",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
]

// Type for platform page data
export interface PlatformPage {
  id: string
  slug: string
  title: string
  meta_title?: string | null
  meta_description?: string | null
  design_json?: Record<string, unknown> | string | null
  html_content?: string | null
  is_published: boolean
  is_homepage: boolean
  editor_type: "sections" | "unlayer"
}

interface PlatformPageBuilderProps {
  page?: PlatformPage | null
}

export function PlatformPageBuilder({ page }: PlatformPageBuilderProps) {
  const router = useRouter()
  const emailEditorRef = useRef<EditorRef | null>(null)

  const [title, setTitle] = useState(page?.title || "")
  const [slug, setSlug] = useState(page?.slug || "")
  const [metaTitle, setMetaTitle] = useState(page?.meta_title || "")
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || "")
  const [isPublished, setIsPublished] = useState(page?.is_published || false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [pageId, setPageId] = useState<string | null>(page?.id || null)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  const onReady: EmailEditorProps["onReady"] = useCallback(
    (unlayer) => {
      setEditorReady(true)

      // Load existing design if editing
      if (page?.design_json) {
        try {
          const design = typeof page.design_json === "string" ? JSON.parse(page.design_json) : page.design_json
          unlayer.loadDesign(design)
        } catch (e) {
          console.error("Failed to load design:", e)
        }
      }
    },
    [page?.design_json],
  )

  const loadTemplate = (template: (typeof PAGE_TEMPLATES)[0]) => {
    const unlayer = emailEditorRef.current?.editor
    if (!unlayer) {
      toast.error("Editor not ready yet")
      return
    }

    if (template.design) {
      unlayer.loadDesign(template.design as any)
      toast.success(`Loaded "${template.name}" template`)
    } else {
      // Blank template - load empty design
      unlayer.loadDesign({ body: { rows: [] } } as any)
      toast.success("Started with blank page")
    }
    setTemplateDialogOpen(false)
  }

  const getEditorContent = (): Promise<{ html: string; design: Record<string, unknown> }> => {
    return new Promise((resolve, reject) => {
      const unlayer = emailEditorRef.current?.editor
      if (!unlayer) {
        reject(new Error("Editor not ready"))
        return
      }

      unlayer.exportHtml((data) => {
        resolve({ html: data.html, design: data.design })
      })
    })
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!page?.id && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(value))
    }
  }

  const handleSaveDraft = async () => {
    if (!title) {
      toast.error("Please add a page title")
      return
    }

    if (!slug) {
      toast.error("Please add a page URL slug")
      return
    }

    if (!editorReady) {
      toast.error("Editor not ready yet")
      return
    }

    setIsSaving(true)

    try {
      const { html, design } = await getEditorContent()

      if (pageId) {
        const result = await saveUnlayerPage(pageId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_description: metaDescription || undefined,
          is_published: false,
        })

        if (!result) {
          toast.error("Failed to save page")
          return
        }

        toast.success("Draft saved")
      } else {
        const result = await createUnlayerPage({
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_description: metaDescription || undefined,
          is_published: false,
        })

        if (!result) {
          toast.error("Failed to create page")
          return
        }

        setPageId(result.id)
        toast.success("Page created")
        router.replace(`/admin/pages/${result.slug}/builder`)
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save page")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!title) {
      toast.error("Please add a page title")
      return
    }

    if (!slug) {
      toast.error("Please add a page URL slug")
      return
    }

    if (!editorReady) {
      toast.error("Editor not ready yet")
      return
    }

    setIsPublishing(true)

    try {
      const { html, design } = await getEditorContent()

      if (pageId) {
        // Save content first
        await saveUnlayerPage(pageId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_description: metaDescription || undefined,
        })
        // Then publish
        await publishUnlayerPage(pageId)
        setIsPublished(true)
        toast.success("Page published!")
      } else {
        // Create new page as published
        const result = await createUnlayerPage({
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_description: metaDescription || undefined,
          is_published: true,
        })

        if (!result) {
          toast.error("Failed to create page")
          return
        }

        setPageId(result.id)
        setIsPublished(true)
        toast.success("Page published!")
        router.replace(`/admin/pages/${result.slug}/builder`)
      }
    } catch (error) {
      console.error("Publish error:", error)
      toast.error("Failed to publish page")
    } finally {
      setIsPublishing(false)
    }
  }

  const handlePreview = async () => {
    if (!slug) {
      toast.error("Please add a page URL slug to preview")
      return
    }

    window.open(`/p/${slug}?preview=true`, "_blank")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin/pages")} className="shrink-0">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex-1 min-w-0 max-w-md">
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Page title"
                  className="font-semibold"
                />
              </div>

              {/* Status badge */}
              {pageId && (
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      Draft
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Templates */}
              <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!editorReady}>
                    <LayoutTemplate className="h-4 w-4 mr-1" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>Start with a pre-designed template or create from scratch</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {PAGE_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => loadTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* SEO Settings */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    SEO
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Page Settings</SheetTitle>
                    <SheetDescription>Configure SEO and page metadata</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>tektonstable.com/p/{slug || "your-page-url"}</span>
                      </div>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                        placeholder="your-page-url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input
                        id="meta-title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || "Page title"}
                      />
                      <p className="text-xs text-muted-foreground">{(metaTitle || title || "").length}/60 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Brief description for search engines..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">{(metaDescription || "").length}/160 characters</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Preview */}
              <Button variant="outline" size="sm" onClick={handlePreview} disabled={!slug}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>

              {/* Save Draft */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing || !editorReady}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
                Save Draft
              </Button>

              {/* Publish */}
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={isSaving || isPublishing || !editorReady}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Globe className="h-4 w-4 mr-1" />}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              minHeight={700}
              options={{
                projectId: UNLAYER_PROJECT_ID ? Number.parseInt(UNLAYER_PROJECT_ID) : undefined,
                displayMode: "web",
                features: {
                  textEditor: {
                    spellChecker: true,
                  },
                  stockImages: {
                    enabled: true,
                  },
                },
                appearance: {
                  theme: "modern_light",
                },
                tabs: {
                  content: {
                    enabled: true,
                  },
                  blocks: {
                    enabled: true,
                  },
                  body: {
                    enabled: true,
                  },
                  images: {
                    enabled: true,
                  },
                },
                tools: {
                  image: {
                    enabled: true,
                  },
                  button: {
                    enabled: true,
                  },
                  text: {
                    enabled: true,
                  },
                  heading: {
                    enabled: true,
                  },
                  html: {
                    enabled: true,
                  },
                  menu: {
                    enabled: true,
                  },
                  social: {
                    enabled: true,
                  },
                  divider: {
                    enabled: true,
                  },
                  video: {
                    enabled: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
