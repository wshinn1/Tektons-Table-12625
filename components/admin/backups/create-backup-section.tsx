"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Save, Database } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createPlatformBackup, createFullBackup, createBlobBackup } from "@/app/actions/backups"

export function CreateBackupSection() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleBackup = async (type: "platform" | "blob" | "full") => {
    setLoading(type)
    try {
      let result
      if (type === "platform") {
        result = await createPlatformBackup()
      } else if (type === "blob") {
        result = await createBlobBackup()
      } else {
        result = await createFullBackup()
      }

      if (result.success) {
        if (type === "platform" && result.downloadUrl) {
          toast.success("Backup created successfully")
          window.open(result.downloadUrl, "_blank")
        } else if (type === "blob") {
          toast.success("Backup saved to blob storage successfully")
        } else if (type === "full" && result.summary) {
          toast.success(
            `Full backup completed! ${result.summary.databaseRecords} records, ${result.summary.mediaFiles} media files, ${result.summary.codeFiles} code files, ${result.summary.migrationScripts} SQL scripts (${result.summary.totalSizeMB} MB)`,
            { duration: 8000 },
          )
        } else {
          toast.success("Backup created successfully")
        }
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create backup")
      }
    } catch (error) {
      toast.error("An error occurred while creating the backup")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Create Backup
        </CardTitle>
        <CardDescription>Download a complete backup of your website data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Your backup will include:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>All pages and sections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Blog posts and content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Menu items and navigation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Events and registrations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Settings and configurations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Donations and funds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Contact submissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Media files metadata</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Testimonials</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={() => handleBackup("platform")} disabled={loading !== null} className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {loading === "platform" ? "Creating..." : "Create & Download Backup"}
          </Button>

          <Button onClick={() => handleBackup("blob")} disabled={loading !== null} variant="outline" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading === "blob" ? "Creating..." : "Create Backup to Blob Storage"}
          </Button>

          <Button
            onClick={() => handleBackup("full")}
            disabled={loading !== null}
            variant="secondary"
            className="w-full"
          >
            <Database className="w-4 h-4 mr-2" />
            {loading === "full" ? "Creating..." : "Create Full Backup (Everything)"}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Full Backup includes:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>All database content (pages, blog, users, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>All uploaded media files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>All application code (components, API routes)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>SQL migration scripts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Markdown files and documentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground">•</span>
              <span>Configuration files (package.json, tsconfig, etc.)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
