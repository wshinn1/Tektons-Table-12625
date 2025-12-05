"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Wand2, Code2 } from "lucide-react"
import { toast } from "sonner"

interface ScreenshotSectionCreatorProps {
  onSectionCreated: (code: string, preview: string) => void
}

export function ScreenshotSectionCreator({ onSectionCreated }: ScreenshotSectionCreatorProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [additionalPrompt, setAdditionalPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const [showCodeEditor, setShowCodeEditor] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateSection = async () => {
    if (!image) {
      toast.error("Please upload a screenshot first")
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("image", image)
      if (additionalPrompt) {
        formData.append("prompt", additionalPrompt)
      }

      const response = await fetch("/api/admin/generate-section-from-screenshot", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to generate section")
      }

      const data = await response.json()
      setGeneratedCode(data.code)
      setShowCodeEditor(true)
      toast.success("Section generated! Review and refine the code below.")
    } catch (error) {
      console.error("Failed to generate section:", error)
      toast.error("Failed to generate section from screenshot")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveSection = () => {
    if (!generatedCode) {
      toast.error("No code to save")
      return
    }
    onSectionCreated(generatedCode, imagePreview)
  }

  return (
    <div className="space-y-6">
      {!showCodeEditor ? (
        <>
          {/* Upload area */}
          <div className="space-y-4">
            <Label>Upload Screenshot</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <Button variant="outline" onClick={() => document.getElementById("screenshot-input")?.click()}>
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a screenshot of the design you want to recreate
                    </p>
                    <Button onClick={() => document.getElementById("screenshot-input")?.click()}>Choose Image</Button>
                  </div>
                </div>
              )}
              <input
                id="screenshot-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Additional instructions */}
          <div className="space-y-2">
            <Label htmlFor="additional-prompt">Additional Instructions (optional)</Label>
            <Textarea
              id="additional-prompt"
              placeholder="E.g., Make the buttons blue, use a darker background, add animation..."
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate button */}
          <Button onClick={generateSection} disabled={!image || isGenerating} className="w-full" size="lg">
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating Section..." : "Generate Section with AI"}
          </Button>
        </>
      ) : (
        <>
          {/* Code editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Code</Label>
              <Button variant="ghost" size="sm" onClick={() => setShowCodeEditor(false)}>
                Back to Upload
              </Button>
            </div>
            <Textarea
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value)}
              rows={20}
              className="font-mono text-sm"
            />
          </div>

          {/* Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label>Original Screenshot</Label>
              <img src={imagePreview || "/placeholder.svg"} alt="Original" className="max-h-48 rounded-lg border" />
            </div>
          )}

          {/* Save button */}
          <Button onClick={handleSaveSection} className="w-full" size="lg">
            <Code2 className="w-4 h-4 mr-2" />
            Save Custom Section
          </Button>
        </>
      )}
    </div>
  )
}
