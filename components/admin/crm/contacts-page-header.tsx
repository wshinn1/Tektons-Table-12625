"use client"

import { MoosendSyncButton } from "@/components/admin/moosend-sync-button"

export function ContactsPageHeader() {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all contacts, organize groups, and track engagement
        </p>
      </div>
      <MoosendSyncButton />
    </div>
  )
}
