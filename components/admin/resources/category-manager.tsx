"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Gift,
  BookOpen,
  Star,
  Lightbulb,
  Target,
  Award,
  Users,
  Heart,
  Zap,
} from "lucide-react"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/resources"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  is_premium: boolean
  display_order: number
  icon: string | null
  color: string | null
  resource_count?: { count: number }[]
}

interface CategoryManagerProps {
  initialCategories: Category[]
}

const ICON_OPTIONS = [
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "Star", label: "Star", icon: Star },
  { value: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
  { value: "Target", label: "Target", icon: Target },
  { value: "Award", label: "Award", icon: Award },
  { value: "Users", label: "Users", icon: Users },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Lock", label: "Lock", icon: Lock },
]

const COLOR_OPTIONS = [
  { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-700" },
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-700" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-700" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-700" },
  { value: "amber", label: "Amber", class: "bg-amber-100 text-amber-700" },
  { value: "red", label: "Red", class: "bg-red-100 text-red-700" },
  { value: "pink", label: "Pink", class: "bg-pink-100 text-pink-700" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-700" },
]

function getIconComponent(iconName: string | null) {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName)
  return iconOption?.icon || BookOpen
}

function getColorClass(color: string | null) {
  const colorOption = COLOR_OPTIONS.find((opt) => opt.value === color)
  return colorOption?.class || "bg-gray-100 text-gray-700"
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_premium: false,
    icon: "BookOpen",
    color: "gray",
  })

  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      is_premium: false,
      icon: "BookOpen",
      color: "gray",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      is_premium: category.is_premium,
      icon: category.icon || "BookOpen",
      color: category.color || "gray",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsLoading(true)
    try {
      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Category updated successfully")
          setIsDialogOpen(false)
          router.refresh()
        }
      } else {
        const result = await createCategory(formData)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Category created successfully")
          setIsDialogOpen(false)
          router.refresh()
        }
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    try {
      const result = await deleteCategory(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Category deleted successfully")
        setDeleteConfirm(null)
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const freeCategories = categories.filter((c) => !c.is_premium)
  const premiumCategories = categories.filter((c) => c.is_premium)

  return (
    <div className="space-y-8">
      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Free Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-green-600" />
          Free Categories
        </h2>
        {freeCategories.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">No free categories yet. Create one to get started.</Card>
        ) : (
          <div className="grid gap-3">
            {freeCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              const resourceCount = category.resource_count?.[0]?.count || 0

              return (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getColorClass(category.color)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {resourceCount} resources
                          </Badge>
                        </div>
                        {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Premium Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-purple-600" />
          Premium Categories
          <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">
            $4.99/month
          </Badge>
        </h2>
        {premiumCategories.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No premium categories yet. Create one to start offering premium content.
          </Card>
        ) : (
          <div className="grid gap-3">
            {premiumCategories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              const resourceCount = category.resource_count?.[0]?.count || 0

              return (
                <Card key={category.id} className="p-4 border-purple-200 bg-purple-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getColorClass(category.color)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{category.name}</h3>
                          <Badge variant="outline" className="border-purple-500 text-purple-600 text-xs">
                            <Lock className="mr-1 h-3 w-3" />
                            Premium
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {resourceCount} resources
                          </Badge>
                        </div>
                        {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Add a new category to organize your resources."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fundraising Strategies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${opt.class}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50/50">
              <div>
                <Label htmlFor="is_premium" className="font-medium">
                  Premium Category
                </Label>
                <p className="text-sm text-gray-500">Requires $4.99/month subscription to access</p>
              </div>
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? Resources in this category will not be deleted, but will be
              unassigned from it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
