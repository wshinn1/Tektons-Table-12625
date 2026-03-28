"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContactsPageHeader() {
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  async function handleSync() {
    setIsSyncing(true)

    try {
      const response = await fetch("/api/admin/moosend-sync", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Sync failed")
      }

      toast({
        title: "Moosend Sync Complete",
        description: `Synced ${data.synced.tenants} tenants, ${data.synced.subscribers} subscribers, ${data.synced.supporters} supporters${data.errors > 0 ? ` (${data.errors} errors)` : ""}`,
      })
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all contacts, organize groups, and track engagement
        </p>
      </div>
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        className="gap-2"
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Sync to Moosend
      </Button>
    </div>
  )
}
