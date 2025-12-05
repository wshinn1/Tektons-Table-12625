"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import {
  createSubscriberGroup,
  updateSubscriberGroup,
  deleteSubscriberGroup,
  type SubscriberGroup,
} from "@/app/actions/subscriber-groups"

interface GroupManagerProps {
  tenantId: string
  groups: SubscriberGroup[]
  onGroupsChange: () => void
}

export function GroupManager({ tenantId, groups, onGroupsChange }: GroupManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<SubscriberGroup | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "" })

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a group name")
      return
    }

    setIsSubmitting(true)
    const result = await createSubscriberGroup(tenantId, formData.name, formData.description)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Group created successfully")
      setFormData({ name: "", description: "" })
      setCreateOpen(false)
      onGroupsChange()
    } else {
      toast.error(result.error || "Failed to create group")
    }
  }

  const handleUpdate = async () => {
    if (!editGroup || !formData.name.trim()) {
      toast.error("Please enter a group name")
      return
    }

    setIsSubmitting(true)
    const result = await updateSubscriberGroup(editGroup.id, formData.name, formData.description)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Group updated successfully")
      setEditGroup(null)
      setFormData({ name: "", description: "" })
      onGroupsChange()
    } else {
      toast.error(result.error || "Failed to update group")
    }
  }

  const handleDelete = async (group: SubscriberGroup) => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? Subscribers will not be deleted.`)) {
      return
    }

    const result = await deleteSubscriberGroup(group.id)
    if (result.success) {
      toast.success("Group deleted")
      onGroupsChange()
    } else {
      toast.error(result.error || "Failed to delete group")
    }
  }

  const openEdit = (group: SubscriberGroup) => {
    setFormData({ name: group.name, description: group.description || "" })
    setEditGroup(group)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Subscriber Groups</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a custom group to organize your subscribers. You can target specific groups when sending
                newsletters or post notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Prayer Team, Volunteers"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this group"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No custom groups yet. Create a group to organize your subscribers.
        </p>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.member_count || 0} {group.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(group)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(group)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editGroup} onOpenChange={(open) => !open && setEditGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
