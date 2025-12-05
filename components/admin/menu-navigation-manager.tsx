"use client"

import type React from "react"

import { useState } from "react"
import { Plus, GripVertical, Pencil, Trash2, ImageIcon, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MenuItemModal } from "./menu-item-modal"
import type { MenuItem, NavigationSettings } from "@/app/actions/menu"
import { deleteMenuItem, reorderMenuItems, updateNavigationSettings } from "@/app/actions/menu"
import { toast } from "sonner"

interface MenuNavigationManagerProps {
  initialItems: MenuItem[]
  initialSettings: NavigationSettings | null
}

export function MenuNavigationManager({ initialItems, initialSettings }: MenuNavigationManagerProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  const [logoType, setLogoType] = useState<"image" | "text">(initialSettings?.logo_type || "image")
  const [logoText, setLogoText] = useState(initialSettings?.logo_text || "TektonStable")
  const [logoImageUrl, setLogoImageUrl] = useState(initialSettings?.logo_image_url || "/tektons-table-logo.png")
  const [savingLogo, setSavingLogo] = useState(false)

  const handleSaveLogoSettings = async () => {
    setSavingLogo(true)
    const result = await updateNavigationSettings({
      logo_type: logoType,
      logo_text: logoText,
      logo_image_url: logoImageUrl,
    })
    setSavingLogo(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Logo settings saved")
    }
  }

  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, targetItem: MenuItem) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.id === targetItem.id) return

    const newItems = [...items]
    const draggedIndex = newItems.findIndex((item) => item.id === draggedItem.id)
    const targetIndex = newItems.findIndex((item) => item.id === targetItem.id)

    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    // Update positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      position: index,
    }))

    setItems(updatedItems)
    setDraggedItem(null)

    // Save to database
    await reorderMenuItems(updatedItems.map((item) => ({ id: item.id, position: item.position })))
    toast.success("Menu order updated")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    const result = await deleteMenuItem(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setItems(items.filter((item) => item.id !== id))
      toast.success("Menu item deleted")
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const leftItems = items.filter((item) => item.navigation_side === "left")
  const rightItems = items.filter((item) => item.navigation_side === "right")

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Navigation</h1>
          <p className="text-gray-500 mt-1">Manage your site navigation menu items</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Logo Settings</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Logo Type</Label>
            <RadioGroup
              value={logoType}
              onValueChange={(v) => setLogoType(v as "image" | "text")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="logo-image" />
                <Label htmlFor="logo-image" className="flex items-center gap-2 cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  Image Logo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="logo-text" />
                <Label htmlFor="logo-text" className="flex items-center gap-2 cursor-pointer">
                  <Type className="w-4 h-4" />
                  Text Logo
                </Label>
              </div>
            </RadioGroup>
          </div>

          {logoType === "text" ? (
            <div>
              <Label htmlFor="logo-text-input" className="text-sm font-medium mb-2 block">
                Logo Text
              </Label>
              <Input
                id="logo-text-input"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                placeholder="Enter your site name"
                className="max-w-md"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="logo-image-url" className="text-sm font-medium mb-2 block">
                Logo Image URL
              </Label>
              <Input
                id="logo-image-url"
                value={logoImageUrl}
                onChange={(e) => setLogoImageUrl(e.target.value)}
                placeholder="/path/to/logo.png"
                className="max-w-md"
              />
              {logoImageUrl && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg inline-block">
                  <img
                    src={logoImageUrl || "/placeholder.svg"}
                    alt="Logo preview"
                    className="h-10 w-auto"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <Button onClick={handleSaveLogoSettings} disabled={savingLogo}>
            {savingLogo ? "Saving..." : "Save Logo Settings"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Drag and drop to reorder items. Items are displayed left-to-right on the website.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Navigation Items</h2>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No menu items yet.</p>
              <Button onClick={handleAddNew} variant="outline" className="mt-4 bg-transparent">
                Add your first menu item
              </Button>
            </div>
          ) : (
            <>
              {leftItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item)}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        Left {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {rightItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item)}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-move hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <Badge variant="outline" className="text-xs">
                        Right {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.published ? "default" : "secondary"}>
                      {item.published ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <MenuItemModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingItem={editingItem}
        allItems={items}
        onSuccess={(newItem) => {
          if (editingItem) {
            setItems(items.map((item) => (item.id === newItem.id ? newItem : item)))
          } else {
            setItems([...items, newItem])
          }
          setModalOpen(false)
        }}
      />
    </div>
  )
}
