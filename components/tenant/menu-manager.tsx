"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Home,
  User,
  FileText,
  Heart,
  LinkIcon,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  type TenantMenuItem,
  createTenantMenuItem,
  updateTenantMenuItem,
  deleteTenantMenuItem,
  reorderTenantMenuItems,
} from "@/app/actions/tenant-menu"
import type { TenantPage } from "@/app/actions/tenant-pages"

const ICONS: Record<string, any> = {
  Home: Home,
  User: User,
  FileText: FileText,
  Heart: Heart,
  Link: LinkIcon,
  ExternalLink: ExternalLink,
}

interface MenuManagerProps {
  tenantId: string
  tenantSlug: string
  initialItems: TenantMenuItem[]
  pages: TenantPage[]
}

export function MenuManager({ tenantId, tenantSlug, initialItems, pages }: MenuManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<TenantMenuItem[]>(initialItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TenantMenuItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Form state
  const [formLabel, setFormLabel] = useState("")
  const [formType, setFormType] = useState<"page" | "url">("url")
  const [formPageId, setFormPageId] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [formIcon, setFormIcon] = useState("Link")
  const [formNewTab, setFormNewTab] = useState(false)

  const resetForm = () => {
    setFormLabel("")
    setFormType("url")
    setFormPageId("")
    setFormUrl("")
    setFormIcon("Link")
    setFormNewTab(false)
    setEditingItem(null)
  }

  const openEditDialog = (item: TenantMenuItem) => {
    setEditingItem(item)
    setFormLabel(item.label)
    setFormType(item.page_id ? "page" : "url")
    setFormPageId(item.page_id || "")
    setFormUrl(item.url || "")
    setFormIcon(item.icon || "Link")
    setFormNewTab(item.open_in_new_tab)
    setIsAddDialogOpen(true)
  }

  const handleSaveItem = async () => {
    if (!formLabel.trim()) {
      toast.error("Please enter a label")
      return
    }

    if (formType === "url" && !formUrl.trim()) {
      toast.error("Please enter a URL")
      return
    }

    if (formType === "page" && !formPageId) {
      toast.error("Please select a page")
      return
    }

    setIsSaving(true)

    try {
      const selectedPage = pages.find((p) => p.id === formPageId)
      const data = {
        label: formLabel.trim(),
        url: formType === "page" ? `/${selectedPage?.slug}` : formUrl.trim(),
        page_id: formType === "page" ? formPageId : null,
        icon: formIcon,
        open_in_new_tab: formNewTab,
      }

      if (editingItem) {
        const result = await updateTenantMenuItem(editingItem.id, data)
        if (result.success) {
          toast.success("Menu item updated")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to update")
        }
      } else {
        const result = await createTenantMenuItem(tenantId, data)
        if (result.success) {
          toast.success("Menu item added")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to add")
        }
      }

      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleVisibility = async (item: TenantMenuItem) => {
    const result = await updateTenantMenuItem(item.id, { is_visible: !item.is_visible })
    if (result.success) {
      setItems(items.map((i) => (i.id === item.id ? { ...i, is_visible: !i.is_visible } : i)))
      toast.success(item.is_visible ? "Menu item hidden" : "Menu item shown")
    } else {
      toast.error(result.error || "Failed to update")
    }
  }

  const handleDelete = async (item: TenantMenuItem) => {
    if (item.is_system) {
      toast.error("Cannot delete system menu items. You can hide them instead.")
      return
    }

    const result = await deleteTenantMenuItem(item.id)
    if (result.success) {
      setItems(items.filter((i) => i.id !== item.id))
      toast.success("Menu item deleted")
    } else {
      toast.error(result.error || "Failed to delete")
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    setItems(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)

    const orderedIds = items.map((item) => item.id)
    const result = await reorderTenantMenuItems(tenantId, orderedIds)
    if (result.success) {
      toast.success("Menu order saved")
    } else {
      toast.error("Failed to save order")
      router.refresh()
    }
  }

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = ICONS[name] || LinkIcon
    return <Icon className="h-4 w-4" />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>Drag items to reorder. Toggle visibility to show/hide items.</CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg border ${
                  draggedIndex === index ? "opacity-50 border-primary" : "border-transparent"
                } ${!item.is_visible ? "opacity-60" : ""}`}
              >
                <div className="cursor-grab hover:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <IconComponent name={item.icon || "Link"} />
                  <span className="font-medium">{item.label}</span>
                  {item.is_system && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">System</span>
                  )}
                  {item.open_in_new_tab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                </div>

                <div className="text-sm text-muted-foreground font-mono">{item.url}</div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleVisibility(item)}
                    title={item.is_visible ? "Hide" : "Show"}
                  >
                    {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>

                  {!item.is_system && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No menu items yet. Add your first item to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update this menu item" : "Add a new item to your navigation menu"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="Menu label"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as "page" | "url")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">Custom URL</SelectItem>
                  <SelectItem value="page">Custom Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formType === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="/path or https://..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Page</Label>
                <Select value={formPageId} onValueChange={setFormPageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No published pages yet. Create and publish a page first.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={formIcon} onValueChange={setFormIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ICONS).map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <div className="flex items-center gap-2">
                        <IconComponent name={icon} />
                        {icon}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newTab">Open in new tab</Label>
              <Switch id="newTab" checked={formNewTab} onCheckedChange={setFormNewTab} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
