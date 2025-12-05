"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { restoreBackup } from "@/app/actions/backups"

export function RestoreBackupSection() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRestore = async () => {
    if (!file) {
      toast.error("Please select a backup file")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await restoreBackup(formData)

      if (result.success) {
        toast.success("Backup restored successfully")
        setFile(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to restore backup")
      }
    } catch (error) {
      toast.error("An error occurred while restoring the backup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Restore Backup
        </CardTitle>
        <CardDescription>Upload a backup file to restore your website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="backup-file" className="block text-sm font-medium mb-2">
            Select Backup File
          </label>
          <Input
            id="backup-file"
            type="file"
            accept=".json,.zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
          {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Restoring will overwrite all current data. Make sure you have a recent backup before proceeding.
          </AlertDescription>
        </Alert>

        <Button onClick={handleRestore} disabled={!file || loading} className="w-full bg-red-600 hover:bg-red-700">
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Restoring..." : "Restore Backup"}
        </Button>
      </CardContent>
    </Card>
  )
}
