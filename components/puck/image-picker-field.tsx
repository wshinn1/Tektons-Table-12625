"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { FieldLabel } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Upload, Search, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  value: string
  label: string
  url: string
  alt?: string
  type?: string
}

interface ImagePickerFieldProps {
  field: { label?: string }
  name: string
  value: string
  onChange: (value: string) => void
  tenantId: string
}

export function ImagePickerField({ field, name, value, onChange, tenantId }: ImagePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>(value || "")
  const [manualUrl, setManualUrl] = useState("")

  const fetchImages = useCallback(
    async (query?: string) => {
      if (!tenantId) return
      setLoading(true)
      try {
        const params = new URLSearchParams({ type: "media" })
        if (query) params.set("query", query)
        const res = await fetch(`/api/tenant/${tenantId}/puck-external?${params}`)
        if (res.ok) {
          const data = await res.json()
          setImages(data)
        }
      } catch (error) {
        console.error("Failed to fetch images:", error)
      } finally {
        setLoading(false)
      }
    },
    [tenantId],
  )

  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open, fetchImages])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchImages(query)
  }

  const handleSelect = (url: string) => {
    setSelectedImage(url)
  }

  const handleConfirm = () => {
    onChange(selectedImage)
    setOpen(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tenantId", tenantId)

      const res = await fetch(`/api/tenant/${tenantId}/media/upload`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedImage(data.url)
        fetchImages() // Refresh the gallery
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleManualUrlSubmit = () => {
    if (manualUrl) {
      setSelectedImage(manualUrl)
      onChange(manualUrl)
      setOpen(false)
    }
  }

  return (
    <FieldLabel label={field.label || "Image"}>
      <div className="space-y-2">
        {/* Current image preview */}
        {value && (
          <div className="relative group rounded-lg overflow-hidden border border-border bg-muted">
            <img src={value || "/placeholder.svg"} alt="Selected" className="w-full h-32 object-cover" />
            <button
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Select button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <ImageIcon className="h-4 w-4" />
              {value ? "Change Image" : "Select Image"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="gallery" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery">Media Library</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
                <TabsTrigger value="url">Enter URL</TabsTrigger>
              </TabsList>

              {/* Media Library Tab */}
              <TabsContent value="gallery" className="flex-1 flex flex-col overflow-hidden mt-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Image Grid */}
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <p>No images found</p>
                      <p className="text-sm">Upload images to your media library</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                      {images.map((image) => (
                        <button
                          key={image.url}
                          onClick={() => handleSelect(image.url)}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:ring-2 hover:ring-primary/50",
                            selectedImage === image.url ? "border-primary ring-2 ring-primary" : "border-transparent",
                          )}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt || image.label}
                            className="w-full h-full object-cover"
                          />
                          {selectedImage === image.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary rounded-full p-1">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-xs text-white truncate">{image.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Confirm Button */}
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} disabled={!selectedImage}>
                    Select Image
                  </Button>
                </div>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="flex-1 flex flex-col mt-4">
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-muted-foreground">Uploading...</p>
                    </div>
                  ) : selectedImage && !value ? (
                    <div className="flex flex-col items-center gap-4">
                      <img src={selectedImage || "/placeholder.svg"} alt="Uploaded" className="max-h-48 rounded-lg" />
                      <p className="text-sm text-muted-foreground">Image uploaded successfully!</p>
                      <Button onClick={handleConfirm}>Use This Image</Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Upload an image</p>
                      <p className="text-sm text-muted-foreground mb-4">PNG, JPG, GIF, WEBP up to 10MB</p>
                      <label>
                        <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
                        <Button asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* URL Tab */}
              <TabsContent value="url" className="flex-1 flex flex-col mt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Enter the URL of an image from the web</p>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                    />
                  </div>

                  {manualUrl && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                      <img
                        src={manualUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  <Button onClick={handleManualUrlSubmit} disabled={!manualUrl} className="w-full">
                    Use This URL
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </FieldLabel>
  )
}

// Factory function to create the custom field config
export const createImagePickerField = (tenantId: string, label = "Image") => ({
  type: "custom" as const,
  label,
  render: ({ field, name, value, onChange }: any) => (
    <ImagePickerField field={field} name={name} value={value || ""} onChange={onChange} tenantId={tenantId} />
  ),
})
