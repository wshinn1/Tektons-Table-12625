"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { SubscriberGroup } from "@/app/actions/subscriber-groups"

interface GroupSelectorProps {
  groups: SubscriberGroup[]
  selectedGroups: string[]
  onChange: (groups: string[]) => void
  showAll?: boolean
  label?: string
}

export function GroupSelector({
  groups,
  selectedGroups,
  onChange,
  showAll = true,
  label = "Send to",
}: GroupSelectorProps) {
  const handleToggle = (groupId: string) => {
    if (groupId === "all") {
      // If selecting "all", clear other selections
      onChange(selectedGroups.includes("all") ? [] : ["all"])
      return
    }

    // If a specific group is selected, remove "all"
    let newGroups = selectedGroups.filter((g) => g !== "all")

    if (newGroups.includes(groupId)) {
      newGroups = newGroups.filter((g) => g !== groupId)
    } else {
      newGroups = [...newGroups, groupId]
    }

    // If nothing selected, default to all
    if (newGroups.length === 0) {
      newGroups = ["all"]
    }

    onChange(newGroups)
  }

  const isAllSelected = selectedGroups.includes("all")

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="space-y-2">
        {showAll && (
          <div className="flex items-center space-x-2">
            <Checkbox id="group-all" checked={isAllSelected} onCheckedChange={() => handleToggle("all")} />
            <label
              htmlFor="group-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              All Subscribers
            </label>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="group-followers"
            checked={selectedGroups.includes("followers") && !isAllSelected}
            disabled={isAllSelected}
            onCheckedChange={() => handleToggle("followers")}
          />
          <label
            htmlFor="group-followers"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Followers (default group)
          </label>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="flex items-center space-x-2">
            <Checkbox
              id={`group-${group.id}`}
              checked={selectedGroups.includes(group.id) && !isAllSelected}
              disabled={isAllSelected}
              onCheckedChange={() => handleToggle(group.id)}
            />
            <label
              htmlFor={`group-${group.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {group.name}
              {group.member_count !== undefined && (
                <span className="text-muted-foreground ml-1">({group.member_count})</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
