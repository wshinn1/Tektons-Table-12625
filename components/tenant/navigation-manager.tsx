"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  Menu,
  Mail,
  FolderOpen,
  LayoutDashboard,
  Users,
  MessageSquare,
  Megaphone,
  Check,
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
import { updateTenantSettings } from "@/app/actions/tenant-settings"
import type { TenantPage } from "@/app/actions/tenant-pages"
import { builtInPages } from "@/app/actions/builtin-pages"

type MenuLocation = "navbar" | "sidebar_admin" | "sidebar_donor"

interface NavigationManagerProps {
  tenantId: string
  tenantSlug: string
  tenantName: string
  initialItems: TenantMenuItem[]
  pages: TenantPage[]
}

export function NavigationManager({ tenantId, tenantSlug, tenantName, initialItems, pages }: NavigationManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<TenantMenuItem[]>(initialItems)
  const [activeTab, setActiveTab] = useState<MenuLocation>("navbar")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TenantMenuItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [siteName, setSiteName] = useState(tenantName || "")
  const [isSavingSiteName, setIsSavingSiteName] = useState(false)
  const [siteNameChanged, setSiteNameChanged] = useState(false)

  const [formLabel, setFormLabel] = useState("")
  const [formType, setFormType] = useState<"page" | "url" | "builtin">("url")
  const [formPageId, setFormPageId] = useState("")
  const [formUrl, setFormUrl] = useState("")
  const [formIcon, setFormIcon] = useState("Link")
  const [formNewTab, setFormNewTab] = useState(false)
  const [formLocation, setFormLocation] = useState<MenuLocation>("navbar")

  const ICONS: Record<string, React.ElementType> = {
    Home: Home,
    User: User,
    FileText: FileText,
    Heart: Heart,
    Link: LinkIcon,
    ExternalLink: ExternalLink,
    Settings: Settings,
    BarChart3: BarChart3,
    CreditCard: CreditCard,
    Bell: Bell,
    Menu: Menu,
    Mail: Mail,
    FolderOpen: FolderOpen,
    LayoutDashboard: LayoutDashboard,
    Users: Users,
    MessageSquare: MessageSquare,
    Megaphone: Megaphone,
  }

  const filteredItems = items.filter((item) => item.menu_location === activeTab)

  const resetForm = () => {
    setFormLabel("")
    setFormType("url")
    setFormPageId("")
    setFormUrl("")
    setFormIcon("Link")
    setFormNewTab(false)
    setFormLocation(activeTab)
    setEditingItem(null)
  }

  const openAddDialog = () => {
    resetForm()
    setFormLocation(activeTab)
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (item: TenantMenuItem) => {
    setEditingItem(item)
    setFormLabel(item.label)
    setFormType(item.page_id ? "page" : "url")
    setFormPageId(item.page_id || "")
    setFormUrl(item.url || "")
    setFormIcon(item.icon || "Link")
    setFormNewTab(item.open_in_new_tab)
    setFormLocation(item.menu_location)
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

    if (formType === "builtin" && !formUrl) {
      toast.error("Please select a built-in page")
      return
    }

    setIsSaving(true)

    try {
      const selectedPage = pages.find((p) => p.id === formPageId)
      const data = {
        label: formLabel.trim(),
        url: formType === "page" ? `/p/${selectedPage?.slug}` : formUrl.trim(),
        page_id: formType === "page" ? formPageId : null,
        icon: formIcon,
        open_in_new_tab: formNewTab,
        menu_location: formLocation,
      }

      if (editingItem) {
        const result = await updateTenantMenuItem(editingItem.id, data)
        if (result.success && result.item) {
          setItems(items.map((i) => (i.id === editingItem.id ? result.item! : i)))
          toast.success("Menu item updated")
        } else {
          toast.error(result.error || "Failed to update")
        }
      } else {
        const result = await createTenantMenuItem(tenantId, data)
        if (result.success && result.item) {
          setItems([...items, result.item])
          toast.success("Menu item added")
        } else {
          toast.error(result.error || "Failed to add")
        }
      }

      setIsAddDialogOpen(false)
      resetForm()
      router.refresh()
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

    const locationItems = filteredItems
    const globalStartIndex = items.findIndex((i) => i.id === locationItems[0]?.id)

    const newItems = [...items]
    const actualDraggedIndex = globalStartIndex + draggedIndex
    const actualTargetIndex = globalStartIndex + index

    const draggedItem = newItems[actualDraggedIndex]
    newItems.splice(actualDraggedIndex, 1)
    newItems.splice(actualTargetIndex, 0, draggedItem)

    setItems(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)

    const locationItems = items.filter((item) => item.menu_location === activeTab)
    const orderedIds = locationItems.map((item) => item.id)
    const result = await reorderTenantMenuItems(tenantId, orderedIds)
    if (result.success) {
      toast.success("Menu order saved")
    } else {
      toast.error("Failed to save order")
      router.refresh()
    }
  }

  const handleSiteNameChange = (value: string) => {
    setSiteName(value)
    setSiteNameChanged(value !== tenantName)
  }

  const handleSaveSiteName = async () => {
    if (!siteName.trim()) {
      toast.error("Site name cannot be empty")
      return
    }

    setIsSavingSiteName(true)
    try {
      const result = await updateTenantSettings({ full_name: siteName.trim() })
      if (result.success) {
        toast.success("Site name updated")
        setSiteNameChanged(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update site name")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSavingSiteName(false)
    }
  }

  const IconComponent = ({ name }: { name: string }) => {
    const Icon = ICONS[name] || LinkIcon
    return <Icon className="h-4 w-4" />
  }

  const getLocationDescription = (location: MenuLocation) => {
    switch (location) {
      case "navbar":
        return "Items shown in the top navigation bar for all visitors"
      case "sidebar_admin":
        return "Items shown in the admin sidebar when logged in as site owner"
      case "sidebar_donor":
        return "Items shown in the donor sidebar when logged in as a supporter"
    }
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Site Name</CardTitle>
          <CardDescription>
            The name displayed in your navigation bar. This is what visitors see as your site title.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={siteName}
              onChange={(e) => handleSiteNameChange(e.target.value)}
              placeholder="Your site name"
              className="max-w-md"
            />
            <Button
              onClick={handleSaveSiteName}
              disabled={!siteNameChanged || isSavingSiteName}
              variant={siteNameChanged ? "default" : "outline"}
            >
              {isSavingSiteName ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div className="bg-white border rounded-lg p-3 shadow-sm inline-block">
              <span className="font-bold text-lg">{siteName || tenantSlug}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MenuLocation)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="navbar">Public Navbar</TabsTrigger>
          <TabsTrigger value="sidebar_admin">Admin Sidebar</TabsTrigger>
          <TabsTrigger value="sidebar_donor">Donor Sidebar</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                How your {activeTab === "navbar" ? "navigation bar" : "sidebar"} will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "navbar" ? (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">{siteName || tenantSlug}</span>
                    <div className="flex items-center gap-6">
                      {filteredItems
                        .filter((i) => i.is_visible)
                        .map((item) => (
                          <span key={item.id} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                            {item.label}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 w-64">
                  <div className="space-y-1">
                    {filteredItems
                      .filter((i) => i.is_visible)
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded text-gray-300 text-sm">
                          <IconComponent name={item.icon || "Link"} />
                          <span>{item.label}</span>
                          {item.is_system && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">System</span>
                          )}
                          {item.open_in_new_tab && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Items</CardTitle>
                  <CardDescription>{getLocationDescription(activeTab)}</CardDescription>
                </div>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredItems.map((item, index) => (
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

                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No menu items in this location. Add your first item to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              {editingItem ? "Update this menu item" : "Add a new item to your navigation"}
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
              <Select value={formType} onValueChange={(v) => setFormType(v as "page" | "url" | "builtin")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="builtin">Built-in Page</SelectItem>
                  <SelectItem value="page">Custom Page</SelectItem>
                  <SelectItem value="url">Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formType === "builtin" && (
              <div className="space-y-2">
                <Label>Select Page</Label>
                <Select
                  value={formUrl}
                  onValueChange={(v) => {
                    setFormUrl(v)
                    const page = builtInPages.find((p) => p.url === v)
                    if (page && !formLabel) setFormLabel(page.label)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a built-in page" />
                  </SelectTrigger>
                  <SelectContent>
                    {builtInPages.map((page) => (
                      <SelectItem key={page.url} value={page.url}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formType === "url" && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="/path or https://..."
                />
              </div>
            )}

            {formType === "page" && (
              <div className="space-y-2">
                <Label>Select Page</Label>
                <Select value={formPageId} onValueChange={setFormPageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a custom page" />
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

            <div className="space-y-2">
              <Label>Menu Location</Label>
              <Select value={formLocation} onValueChange={(v) => setFormLocation(v as MenuLocation)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navbar">Public Navbar</SelectItem>
                  <SelectItem value="sidebar_admin">Admin Sidebar</SelectItem>
                  <SelectItem value="sidebar_donor">Donor Sidebar</SelectItem>
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
