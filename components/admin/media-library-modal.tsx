"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMediaLibrary, deleteMedia } from "@/app/actions/media"
import { Upload, Trash2, Check } from "lucide-react"

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

interface MediaItem {
  id: string
  url: string
  original_filename: string
  mime_type: string
  file_size: number
  width: number | null
  height: number | null
  alt_text: string | null
  created_at: string
}

export function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadMedia()
    }
  }, [open])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const data = await getMediaLibrary()
      setMedia(data)
    } catch (error) {
      console.error("Failed to load media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      console.log("[v0] Starting upload:", file.name)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/media", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Upload response status:", response.status)
      const data = await response.json()
      console.log("[v0] Upload response data:", data)

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed")
      }

      await loadMedia()
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      await deleteMedia(id, url)
      await loadMedia()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete image")
    }
  }

  const handleSelectImage = () => {
    if (selectedUrl) {
      onSelect(selectedUrl)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[80vh] w-[95vw] sm:w-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Upload Section */}
          <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="media-upload"
            />
            <Label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
            </Label>
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : media.length === 0 ? (
              <div className="text-center py-8 text-sm sm:text-base text-muted-foreground px-4">
                No images uploaded yet. Upload your first image above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedUrl === item.url
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedUrl(item.url)}
                  >
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.alt_text || item.original_filename}
                        className="w-full h-full object-cover"
                      />
                      {selectedUrl === item.url && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 sm:p-2 bg-background">
                      <p className="text-[10px] sm:text-xs truncate font-medium">{item.original_filename}</p>
                      <p className="text-[9px] sm:text-xs text-muted-foreground">
                        {item.width && item.height && `${item.width} × ${item.height}`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id, item.url)
                      }}
                      className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-destructive text-destructive-foreground rounded-full p-1 sm:p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse xs:flex-row justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose} className="w-full xs:w-auto bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSelectImage} disabled={!selectedUrl} className="w-full xs:w-auto">
              Select Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
