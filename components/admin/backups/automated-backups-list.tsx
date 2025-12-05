"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, Clock, Database, HardDrive } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteBackup, restoreBackupById } from "@/app/actions/backups"

interface Backup {
  id: string
  backup_type: string
  file_size_bytes: number
  record_count: number
  created_at: string
  blob_url: string | null
  backup_category: string
  tenants?: {
    full_name: string
    subdomain: string
  } | null
}

interface Props {
  backups: Backup[]
  totalCount: number
}

export function AutomatedBackupsList({ backups, totalCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedBackups = backups.slice(startIndex, endIndex)
  const totalPages = Math.ceil(backups.length / itemsPerPage)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) return

    setLoading(id)
    try {
      const result = await deleteBackup(id)
      if (result.success) {
        toast.success("Backup deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete backup")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the backup")
    } finally {
      setLoading(null)
    }
  }

  const handleRestore = async (id: string) => {
    if (!confirm("Are you sure you want to restore this backup? This will overwrite current data.")) return

    setLoading(id)
    try {
      const result = await restoreBackupById(id)
      if (result.success) {
        toast.success("Backup restored successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to restore backup")
      }
    } catch (error) {
      toast.error("An error occurred while restoring the backup")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Automated & Manual Backups
        </CardTitle>
        <CardDescription>
          Automated backups run at 12:00 AM and 12:00 PM EST daily. Email notifications sent to all super admins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedBackups.map((backup) => (
          <div
            key={backup.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {backup.backup_type === "scheduled" ? (
                  <>
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Automated Full Backup</span>
                  </>
                ) : backup.backup_category === "full" ? (
                  <>
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Manual Full Backup</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Manual Database Backup</span>
                  </>
                )}
                {backup.tenants && <span className="text-sm text-muted-foreground">• {backup.tenants.full_name}</span>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(backup.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })} EST</span>
                <span>• {(backup.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                {backup.record_count && <span>• {backup.record_count.toLocaleString()} records</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(backup.id)}
                disabled={loading === backup.id}
              >
                <Upload className="w-4 h-4 mr-2" />
                Restore
              </Button>
              <Button size="sm" variant="outline" asChild disabled={!backup.blob_url}>
                <a href={backup.blob_url || "#"} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(backup.id)}
                disabled={loading === backup.id}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {displayedBackups.length === 0 && <p className="text-center text-muted-foreground py-8">No backups found</p>}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, backups.length)} of {totalCount} backups
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
