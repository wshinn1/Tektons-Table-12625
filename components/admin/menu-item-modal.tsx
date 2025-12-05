"use client"

import { useState, useEffect } from "react"
import { X, FileText, LinkIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MenuItem } from "@/app/actions/menu"
import { createMenuItem, updateMenuItem } from "@/app/actions/menu"
import { getAllPagesForAdmin } from "@/app/actions/pages"
import { toast } from "sonner"

interface MenuItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem: MenuItem | null
  allItems: MenuItem[]
  onSuccess: (item: MenuItem) => void
}

interface PageOption {
  id: string
  title: string
  slug: string
  is_published: boolean
  editor_type: string
}

export function MenuItemModal({ open, onOpenChange, editingItem, allItems, onSuccess }: MenuItemModalProps) {
  const [label, setLabel] = useState("")
  const [url, setUrl] = useState("")
  const [parentId, setParentId] = useState<string>("none")
  const [isDropdown, setIsDropdown] = useState(false)
  const [navigationSide, setNavigationSide] = useState<"left" | "right">("left")
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)

  const [linkType, setLinkType] = useState<"custom" | "page">("custom")
  const [pages, setPages] = useState<PageOption[]>([])
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const [loadingPages, setLoadingPages] = useState(false)

  useEffect(() => {
    if (open) {
      setLoadingPages(true)
      getAllPagesForAdmin()
        .then((data) => {
          setPages(data)
        })
        .finally(() => setLoadingPages(false))
    }
  }, [open])

  useEffect(() => {
    if (editingItem) {
      setLabel(editingItem.label)
      setUrl(editingItem.url)
      setParentId(editingItem.parent_id || "none")
      setIsDropdown(editingItem.is_dropdown)
      setNavigationSide(editingItem.navigation_side)
      setPublished(editingItem.published)

      if (editingItem.url.startsWith("/p/")) {
        setLinkType("page")
        const pageSlug = editingItem.url.replace("/p/", "")
        const matchingPage = pages.find((p) => p.slug === pageSlug)
        if (matchingPage) {
          setSelectedPageId(matchingPage.id)
        }
      } else {
        setLinkType("custom")
        setSelectedPageId("")
      }
    } else {
      // Reset form
      setLabel("")
      setUrl("")
      setParentId("none")
      setIsDropdown(false)
      setNavigationSide("left")
      setPublished(true)
      setLinkType("custom")
      setSelectedPageId("")
    }
  }, [editingItem, open, pages])

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId)
    const page = pages.find((p) => p.id === pageId)
    if (page) {
      setUrl(`/p/${page.slug}`)
      if (!label) {
        setLabel(page.title)
      }
    }
  }

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error("Please enter a label")
      return
    }

    if (linkType === "custom" && !url.trim()) {
      toast.error("Please enter a URL")
      return
    }

    if (linkType === "page" && !selectedPageId) {
      toast.error("Please select a page")
      return
    }

    setSaving(true)

    const finalUrl = linkType === "page" ? `/p/${pages.find((p) => p.id === selectedPageId)?.slug}` : url.trim()

    const data = {
      label: label.trim(),
      url: finalUrl,
      parent_id: parentId === "none" ? null : parentId,
      is_dropdown: isDropdown,
      navigation_side: navigationSide,
      published,
      tenant_id: null,
      position: editingItem?.position ?? allItems.length,
    }

    try {
      if (editingItem) {
        const result = await updateMenuItem(editingItem.id, data)
        if (result.error) {
          toast.error(result.error)
        } else if (result.menuItem) {
          toast.success("Menu item updated")
          onSuccess(result.menuItem)
        }
      } else {
        const result = await createMenuItem(data)
        if (result.error) {
          toast.error(result.error)
        } else if (result.menuItem) {
          toast.success("Menu item created")
          onSuccess(result.menuItem)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const topLevelItems = allItems.filter((item) => !item.parent_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">Create a navigation menu item</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" placeholder="Home" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Link Type</Label>
            <Tabs value={linkType} onValueChange={(v) => setLinkType(v as "custom" | "page")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="custom" className="gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Custom URL
                </TabsTrigger>
                <TabsTrigger value="page" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Select Page
                </TabsTrigger>
              </TabsList>

              <TabsContent value="custom" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" placeholder="/" value={url} onChange={(e) => setUrl(e.target.value)} />
                  <p className="text-xs text-gray-500">
                    Enter a relative URL (e.g., /about) or full URL (e.g., https://example.com)
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="page" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="page-select">Select a Page</Label>
                  <Select value={selectedPageId} onValueChange={handlePageSelect} disabled={loadingPages}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPages ? "Loading pages..." : "Choose a page"} />
                    </SelectTrigger>
                    <SelectContent>
                      {pages.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No pages available
                        </SelectItem>
                      ) : (
                        pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            <div className="flex items-center gap-2">
                              <span>{page.title}</span>
                              {!page.is_published && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Draft</span>
                              )}
                              <span className="text-xs text-gray-400">/p/{page.slug}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Link to a page created with the Page Builder. Draft pages will not be visible to visitors.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Menu Item (Optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="None (Top Level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {topLevelItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Select a dropdown parent to make this a submenu item</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="dropdown">Make this a dropdown menu</Label>
            </div>
            <Switch id="dropdown" checked={isDropdown} onCheckedChange={setIsDropdown} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="side">Navigation Side</Label>
            <Select value={navigationSide} onValueChange={(value) => setNavigationSide(value as "left" | "right")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left (before logo)</SelectItem>
                <SelectItem value="right">Right (after logo)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Choose which side of the logo this menu item appears on</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="published">Published</Label>
            </div>
            <Switch id="published" checked={published} onCheckedChange={setPublished} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
