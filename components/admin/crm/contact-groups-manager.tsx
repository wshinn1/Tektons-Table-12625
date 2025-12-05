"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Users, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactGroup {
  id: string
  name: string
  description: string
  is_system: boolean
  member_count?: number
  created_at: string
}

export function ContactGroupsManager() {
  const [groups, setGroups] = useState<ContactGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/admin/contact-groups")
      if (!res.ok) throw new Error("Failed to fetch groups")
      const data = await res.json()
      setGroups(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contact groups",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingGroup ? `/api/admin/contact-groups/${editingGroup.id}` : "/api/admin/contact-groups"
      const res = await fetch(url, {
        method: editingGroup ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to save group")

      toast({
        title: "Success",
        description: `Group ${editingGroup ? "updated" : "created"} successfully`,
      })

      setIsDialogOpen(false)
      setFormData({ name: "", description: "" })
      setEditingGroup(null)
      fetchGroups()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingGroup ? "update" : "create"} group`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      const res = await fetch(`/api/admin/contact-groups/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete group")

      toast({
        title: "Success",
        description: "Group deleted successfully",
      })

      fetchGroups()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (group: ContactGroup) => {
    setEditingGroup(group)
    setFormData({ name: group.name, description: group.description || "" })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingGroup(null)
    setFormData({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading groups...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">{groups.length} total groups</p>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.is_system && <span className="text-xs text-muted-foreground">System Group</span>}
                </div>
              </div>
              {!group.is_system && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(group)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description || "No description"}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Members</span>
              <span className="font-semibold">{group.member_count || 0}</span>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "Create New Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup ? "Update the group details below" : "Create a new contact group for organizing contacts"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Group Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Donors"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this group"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>{editingGroup ? "Update" : "Create"} Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
