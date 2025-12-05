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
import { createTenantPage, updateTenantPage, type TenantPage } from "@/app/actions/tenant-pages"

const EmailEditor = dynamic(() => import("react-email-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">Loading page builder...</p>
      </div>
    </div>
  ),
})

const UNLAYER_PROJECT_ID = process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID

const PAGE_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch",
    design: null,
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
                      padding: "40px 20px",
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
                      src: { url: "/professional-headshot.png" },
                      textAlign: "center",
                      padding: "20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "text",
                    values: {
                      text: "<p>Share your story here. Tell visitors who you are, what you do, and why it matters. This is your chance to connect with your audience on a personal level.</p><p>Add more paragraphs to share your journey, your mission, and your vision for the future.</p>",
                      padding: "20px",
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
    id: "landing",
    name: "Landing Page",
    description: "Hero section with call to action",
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
                      text: "Welcome to Our Ministry",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "60px 20px 20px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center; font-size:18px;'>Join us in making a difference in the world. Your support helps us reach more people and spread hope.</p>",
                      padding: "0 40px 20px",
                    },
                  },
                  {
                    type: "button",
                    values: {
                      text: "Get Involved",
                      textAlign: "center",
                      padding: "20px",
                      buttonColors: {
                        color: "#ffffff",
                        backgroundColor: "#1e3a8a",
                      },
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
                    values: { text: "Our Mission", headingType: "h3", textAlign: "center", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Describe your mission and what drives your work.</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Our Impact", headingType: "h3", textAlign: "center", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Share the impact you've made in numbers or stories.</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Get Involved", headingType: "h3", textAlign: "center", padding: "20px" },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>Explain how visitors can support your cause.</p>",
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
                      padding: "40px 20px 10px",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p style='text-align:center;'>We'd love to hear from you. Reach out with questions, prayer requests, or to learn more about partnering with us.</p>",
                      padding: "10px 40px 30px",
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
                      text: "<p><strong>Email:</strong> your@email.com</p><p><strong>Phone:</strong> (555) 123-4567</p><p><strong>Address:</strong><br/>123 Main Street<br/>City, State 12345</p>",
                      padding: "0 20px 20px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "heading",
                    values: { text: "Follow Us", headingType: "h3", padding: "20px" },
                  },
                  {
                    type: "social",
                    values: {
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
    id: "gallery",
    name: "Photo Gallery",
    description: "Showcase photos in a grid layout",
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
                      text: "Photo Gallery",
                      headingType: "h1",
                      textAlign: "center",
                      padding: "40px 20px",
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
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-1.jpg" },
                      padding: "10px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-2.jpg" },
                      padding: "10px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-3.jpg" },
                      padding: "10px",
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
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-4.jpg" },
                      padding: "10px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-5.jpg" },
                      padding: "10px",
                    },
                  },
                ],
              },
              {
                contents: [
                  {
                    type: "image",
                    values: {
                      src: { url: "/mission-work-photo-6.jpg" },
                      padding: "10px",
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

interface PageEditorProps {
  tenantId: string
  subdomain: string
  page?: TenantPage | null
}

export function PageEditor({ tenantId, subdomain, page }: PageEditorProps) {
  const router = useRouter()
  const emailEditorRef = useRef<EditorRef | null>(null)

  const [title, setTitle] = useState(page?.title || "")
  const [slug, setSlug] = useState(page?.slug || "")
  const [metaTitle, setMetaTitle] = useState(page?.meta_title || "")
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || "")
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
    if (!slug || slug === generateSlug(title)) {
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
        const result = await updateTenantPage(pageId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          status: "draft",
        })

        if (!result.success) {
          toast.error(result.error || "Failed to save page")
          return
        }

        toast.success("Draft saved")
      } else {
        const result = await createTenantPage(tenantId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          status: "draft",
        })

        if (!result.success) {
          toast.error(result.error || "Failed to create page")
          return
        }

        setPageId(result.page?.id || null)
        toast.success("Draft saved")

        if (result.page?.id) {
          router.replace(`/admin/pages/${result.page.id}/edit`)
        }
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast.error("Failed to save draft")
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
        const result = await updateTenantPage(pageId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          status: "published",
        })

        if (!result.success) {
          toast.error(result.error || "Failed to publish page")
          return
        }

        toast.success("Page published!")
      } else {
        const result = await createTenantPage(tenantId, {
          title,
          slug,
          design_json: design,
          html_content: html,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          status: "published",
        })

        if (!result.success) {
          toast.error(result.error || "Failed to publish page")
          return
        }

        setPageId(result.page?.id || null)
        toast.success("Page published!")

        if (result.page?.id) {
          router.replace(`/admin/pages/${result.page.id}/edit`)
        }
      }
    } catch (error) {
      console.error("Error publishing:", error)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 shrink-0">
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
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span>/p/{slug || "your-page-url"}</span>
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
                      <p className="text-xs text-gray-500">{(metaTitle || title || "").length}/60 characters</p>
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
                      <p className="text-xs text-gray-500">{(metaDescription || "").length}/160 characters</p>
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
