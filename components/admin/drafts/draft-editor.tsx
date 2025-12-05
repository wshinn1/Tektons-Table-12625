"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createDraftPage,
  updateDraftPage,
  deleteDraftPage,
  duplicateDraftPage,
  getDraftVersions,
  restoreDraftVersion,
  type DraftPage,
  type DraftVersion,
} from "@/app/actions/drafts"
import { Save, Trash2, Copy, Download, FileCode, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DraftEditorProps {
  draft?: DraftPage
}

export function DraftEditor({ draft }: DraftEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [versions, setVersions] = useState<DraftVersion[]>([])
  const [showVersions, setShowVersions] = useState(false)

  const [formData, setFormData] = useState({
    title: draft?.title || "",
    slug: draft?.slug || "",
    category: draft?.category || "marketing",
    html_content: draft?.html_content || "",
    notes: draft?.notes || "",
    status: draft?.status || "draft",
  })

  useEffect(() => {
    if (draft?.id) {
      loadVersions()
    }
  }, [draft?.id])

  const loadVersions = async () => {
    if (!draft?.id) return
    try {
      const versionData = await getDraftVersions(draft.id)
      setVersions(versionData)
    } catch (error) {
      console.error("Error loading versions:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (draft) {
        await updateDraftPage(draft.id, formData)
        toast({ title: "Draft updated successfully" })
      } else {
        const newDraft = await createDraftPage(formData)
        toast({ title: "Draft created successfully" })
        router.push(`/admin/drafts/${newDraft.id}`)
      }
    } catch (error) {
      toast({
        title: "Error saving draft",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (!confirm("Are you sure you want to delete this draft?")) return

    setIsDeleting(true)
    try {
      await deleteDraftPage(draft.id)
      toast({ title: "Draft deleted successfully" })
      router.push("/admin/drafts")
    } catch (error) {
      toast({
        title: "Error deleting draft",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    if (!draft) return
    setIsDuplicating(true)
    try {
      const newDraft = await duplicateDraftPage(draft.id)
      toast({ title: "Draft duplicated successfully" })
      router.push(`/admin/drafts/${newDraft.id}`)
    } catch (error) {
      toast({
        title: "Error duplicating draft",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(formData.html_content)
    toast({ title: "HTML copied to clipboard" })
  }

  const handleDownloadHTML = () => {
    const blob = new Blob([formData.html_content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formData.slug || "draft"}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "HTML downloaded" })
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!draft) return
    if (!confirm("Are you sure you want to restore this version? Your current changes will be saved as a new version."))
      return

    try {
      await restoreDraftVersion(draft.id, versionId)
      toast({ title: "Version restored successfully" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error restoring version",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Editor */}
      <div className="col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Pricing Comparison"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="pricing-comparison"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="about">About</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Planning notes, todos, design decisions..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">HTML Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {draft && <TabsTrigger value="versions">Version History ({versions.length})</TabsTrigger>}
          </TabsList>

          <TabsContent value="editor">
            <Card>
              <CardContent className="pt-6">
                <Textarea
                  value={formData.html_content}
                  onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                  placeholder="<div>Your HTML content here...</div>"
                  rows={30}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div className="border rounded-lg p-6 bg-white min-h-[600px]">
                  <div dangerouslySetInnerHTML={{ __html: formData.html_content }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {draft && (
            <TabsContent value="versions">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No version history yet. Versions are created when you save changes.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {versions.map((version) => (
                        <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">Version {version.version_number}</h4>
                              <p className="text-sm text-gray-500">{new Date(version.created_at).toLocaleString()}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleRestoreVersion(version.id)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restore
                            </Button>
                          </div>
                          {version.notes && <p className="text-sm text-gray-600 mt-2">{version.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleCopyHTML} variant="outline" size="sm" className="w-full bg-transparent">
                <FileCode className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
              <Button onClick={handleDownloadHTML} variant="outline" size="sm" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {draft && (
              <Button
                onClick={handleDuplicate}
                disabled={isDuplicating}
                variant="outline"
                className="w-full bg-transparent"
              >
                <Copy className="w-4 h-4 mr-2" />
                {isDuplicating ? "Duplicating..." : "Duplicate"}
              </Button>
            )}

            {draft && (
              <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}

            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href={`/admin/drafts`}>Cancel</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>Use Tailwind classes for styling to match the site</p>
            <p>Draft pages help plan content before building React components</p>
            <p>Preview tab shows rendered HTML</p>
            <p>Version history automatically tracks changes when you save</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
