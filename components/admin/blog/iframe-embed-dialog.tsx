"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface IframeEmbedDialogProps {
  open: boolean
  onClose: () => void
  onEmbed: (src: string, width: string, height: string) => void
}

export function IframeEmbedDialog({ open, onClose, onEmbed }: IframeEmbedDialogProps) {
  const [embedCode, setEmbedCode] = useState("")
  const [src, setSrc] = useState("")
  const [width, setWidth] = useState("100%")
  const [height, setHeight] = useState("640")
  const [mode, setMode] = useState<"code" | "url">("code")

  const handleSubmit = () => {
    console.log("[v0] Iframe embed submit - mode:", mode, "src:", src, "embedCode:", embedCode)

    if (mode === "code") {
      // Parse iframe from HTML code
      const parser = new DOMParser()
      const doc = parser.parseFromString(embedCode, "text/html")
      const iframe = doc.querySelector("iframe")

      if (!iframe) {
        toast.error("No iframe found in the code. Please paste valid iframe HTML.")
        return
      }

      const extractedSrc = iframe.getAttribute("src")
      const extractedWidth = iframe.getAttribute("width") || "100%"
      const extractedHeight = iframe.getAttribute("height") || "640"

      console.log("[v0] Extracted iframe attributes:", { extractedSrc, extractedWidth, extractedHeight })

      if (!extractedSrc) {
        toast.error("Iframe is missing src attribute")
        return
      }

      onEmbed(extractedSrc, extractedWidth, extractedHeight)
      resetAndClose()
    } else {
      // Use direct URL
      if (!src.trim()) {
        toast.error("Please enter a URL")
        return
      }

      console.log("[v0] Using direct URL:", src, width, height)
      onEmbed(src, width, height)
      resetAndClose()
    }
  }

  const resetAndClose = () => {
    setEmbedCode("")
    setSrc("")
    setWidth("100%")
    setHeight("640")
    setMode("code")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Iframe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("code")}
            >
              Paste Embed Code
            </Button>
            <Button
              type="button"
              variant={mode === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("url")}
            >
              Enter URL Manually
            </Button>
          </div>

          {mode === "code" ? (
            <>
              <div>
                <Label htmlFor="embedCode">Paste Iframe Embed Code</Label>
                <Textarea
                  id="embedCode"
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder='<iframe src="https://scribehow.com/embed/..." width="100%" height="800"></iframe>'
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the complete iframe embed code from Scribehow, Loom, YouTube, etc.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="src">Iframe Source URL</Label>
                <Input
                  id="src"
                  type="url"
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="https://example.com/embed/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="100%" />
                </div>
                <div>
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="640"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Embed Iframe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
