"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importSubscribersFromCSV } from "@/app/actions/newsletter"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SubscriberGroup } from "@/app/actions/subscriber-groups"

export function CSVUpload({
  tenantId,
  groups = [],
  onImportComplete,
}: {
  tenantId: string
  groups?: SubscriberGroup[]
  onImportComplete?: () => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>("none")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    } else {
      toast.error("Please select a valid CSV file")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setIsUploading(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].toLowerCase().split(",")

      const emailIndex = headers.findIndex((h) => h.includes("email"))
      const nameIndex = headers.findIndex((h) => h.includes("name"))

      if (emailIndex === -1) {
        toast.error("CSV must contain an email column")
        setIsUploading(false)
        return
      }

      const subscribers = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",")
          return {
            email: values[emailIndex]?.trim(),
            name: nameIndex !== -1 ? values[nameIndex]?.trim() : undefined,
          }
        })
        .filter((sub) => sub.email)

      const result = await importSubscribersFromCSV(
        tenantId,
        subscribers,
        selectedGroup === "none" ? undefined : selectedGroup,
      )
      toast.success(`Successfully imported ${result?.length || 0} subscribers`)
      setFile(null)
      onImportComplete?.()
    } catch (error) {
      toast.error("Failed to import subscribers")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from CSV</CardTitle>
        <CardDescription>Upload a CSV file with email addresses and names (optional)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv">CSV File</Label>
          <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">CSV should have columns: email, name (optional)</p>
        </div>
        {groups.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="import-group">Import to Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger id="import-group">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Followers (default)</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Importing..." : "Import Subscribers"}
        </Button>
      </CardContent>
    </Card>
  )
}
