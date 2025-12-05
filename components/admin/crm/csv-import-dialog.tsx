"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileSpreadsheet } from "lucide-react"

export function CSVImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const contacts = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim())
          return {
            first_name: values[headers.indexOf("first_name")] || values[0] || "",
            last_name: values[headers.indexOf("last_name")] || values[1] || "",
            email: values[headers.indexOf("email")] || values[2] || "",
            phone: values[headers.indexOf("phone")] || values[3] || null,
          }
        })
        .filter((c) => c.email && /\S+@\S+\.\S+/.test(c.email))

      const res = await fetch("/api/admin/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      })

      if (!res.ok) throw new Error("Failed to import")

      const data = await res.json()

      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.imported} contacts`,
      })

      onImportComplete()
      onOpenChange(false)
      setFile(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import CSV",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: first_name, last_name, email, phone (optional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="csv-file" className="cursor-pointer">
              <span className="text-blue-600 hover:underline">Choose a CSV file</span>
              <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </Label>
            {file && <p className="mt-2 text-sm text-muted-foreground">{file.name}</p>}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">CSV Format Example:</p>
            <code className="block bg-white p-2 rounded">
              first_name,last_name,email,phone
              <br />
              John,Doe,john@example.com,+1234567890
              <br />
              Jane,Smith,jane@example.com,
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
