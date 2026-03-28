"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  synced: { tenants: number; subscribers: number; supporters: number; followers: number }
  errors: number
  queryErrors?: string[]
}

export function MoosendSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSync() {
    setSyncing(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/moosend-sync", { method: "POST" })
      const data: SyncResult = await res.json()

      if (!res.ok) {
        throw new Error("Sync failed")
      }

      const { tenants, subscribers, supporters, followers } = data.synced
      const queryErrors = data.queryErrors?.length ? ` | DB errors: ${data.queryErrors.join("; ")}` : ""
      setResult({
        success: true,
        message: `Synced: ${tenants} tenants, ${subscribers} subscribers, ${supporters} donors, ${followers} followers${data.errors > 0 ? ` (${data.errors} Moosend errors)` : ""}${queryErrors}`,
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Sync failed — check console",
      })
      console.error("[MoosendSyncButton] Sync error:", error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        className="gap-2"
        style={{ touchAction: "manipulation" }}
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing..." : "Sync to Moosend"}
      </Button>

      {result && (
        <div
          className={`flex items-center gap-2 text-sm ${result.success ? "text-green-600" : "text-red-600"}`}
        >
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
