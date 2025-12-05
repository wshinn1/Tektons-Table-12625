"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, MoveUp, MoveDown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

type BlockType = "heading" | "paragraph" | "button" | "image" | "divider"

interface EmailBlock {
  id: string
  type: BlockType
  content: string
  style?: {
    color?: string
    fontSize?: string
    textAlign?: string
    buttonColor?: string
    buttonText?: string
    buttonUrl?: string
  }
}

interface SimpleEmailBuilderProps {
  initialContent?: string
  onChange: (html: string) => void
}

export function SimpleEmailBuilder({ initialContent, onChange }: SimpleEmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const addBlock = (type: BlockType) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlock(newBlock.id)
  }

  const getDefaultContent = (type: BlockType): string => {
    switch (type) {
      case "heading":
        return "Your Heading Here"
      case "paragraph":
        return "Write your paragraph text here..."
      case "button":
        return "Click Here"
      case "image":
        return "https://via.placeholder.com/600x300"
      case "divider":
        return ""
      default:
        return ""
    }
  }

  const getDefaultStyle = (type: BlockType) => {
    switch (type) {
      case "heading":
        return { fontSize: "32px", color: "#000000", textAlign: "left" }
      case "paragraph":
        return { fontSize: "16px", color: "#333333", textAlign: "left" }
      case "button":
        return {
          buttonColor: "#0070f3",
          buttonText: "#ffffff",
          textAlign: "center",
        }
      default:
        return {}
    }
  }

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((block) => block.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === blocks.length - 1) return

    const newBlocks = [...blocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  const generateHTML = (): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-block { margin-bottom: 20px; }
    .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
    .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="email-container">
    ${blocks.map((block) => renderBlockHTML(block)).join("\n")}
  </div>
</body>
</html>
    `.trim()
  }

  const renderBlockHTML = (block: EmailBlock): string => {
    const style = block.style || {}

    switch (block.type) {
      case "heading":
        return `<h1 class="email-block" style="font-size: ${style.fontSize}; color: ${style.color}; text-align: ${style.textAlign}; margin: 0;">${block.content}</h1>`

      case "paragraph":
        return `<p class="email-block" style="font-size: ${style.fontSize}; color: ${style.color}; text-align: ${style.textAlign}; line-height: 1.6; margin: 0;">${block.content}</p>`

      case "button":
        return `<div class="email-block" style="text-align: ${style.textAlign};"><a href="${style.buttonUrl || "#"}" class="button" style="background-color: ${style.buttonColor}; color: ${style.buttonText};">${block.content}</a></div>`

      case "image":
        return `<div class="email-block" style="text-align: center;"><img src="${block.content}" alt="Email image" /></div>`

      case "divider":
        return `<div class="divider"></div>`

      default:
        return ""
    }
  }

  const handleGenerate = () => {
    const html = generateHTML()
    onChange(html)
  }

  const selected = blocks.find((b) => b.id === selectedBlock)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Builder Tools */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Add Components</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => addBlock("heading")}>
              <Plus className="h-4 w-4 mr-1" />
              Heading
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock("paragraph")}>
              <Plus className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock("button")}>
              <Plus className="h-4 w-4 mr-1" />
              Button
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock("image")}>
              <Plus className="h-4 w-4 mr-1" />
              Image
            </Button>
            <Button variant="outline" size="sm" onClick={() => addBlock("divider")}>
              <Plus className="h-4 w-4 mr-1" />
              Divider
            </Button>
          </div>
        </Card>

        {/* Block Editor */}
        {selected && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Edit {selected.type}</h3>
            <div className="space-y-3">
              {selected.type !== "divider" && (
                <div>
                  <Label>Content</Label>
                  {selected.type === "image" ? (
                    <Input
                      value={selected.content}
                      onChange={(e) => updateBlock(selected.id, { content: e.target.value })}
                      placeholder="Image URL"
                    />
                  ) : (
                    <Textarea
                      value={selected.content}
                      onChange={(e) => updateBlock(selected.id, { content: e.target.value })}
                      rows={3}
                    />
                  )}
                </div>
              )}

              {selected.type === "button" && (
                <div>
                  <Label>Button Link</Label>
                  <Input
                    value={selected.style?.buttonUrl || ""}
                    onChange={(e) =>
                      updateBlock(selected.id, {
                        style: { ...selected.style, buttonUrl: e.target.value },
                      })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {(selected.type === "heading" || selected.type === "paragraph") && (
                <>
                  <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={selected.style?.color || "#000000"}
                      onChange={(e) =>
                        updateBlock(selected.id, {
                          style: { ...selected.style, color: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Text Align</Label>
                    <Select
                      value={selected.style?.textAlign || "left"}
                      onValueChange={(value) =>
                        updateBlock(selected.id, {
                          style: { ...selected.style, textAlign: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selected.type === "button" && (
                <div>
                  <Label>Button Color</Label>
                  <Input
                    type="color"
                    value={selected.style?.buttonColor || "#0070f3"}
                    onChange={(e) =>
                      updateBlock(selected.id, {
                        style: { ...selected.style, buttonColor: e.target.value },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        <Button onClick={handleGenerate} className="w-full">
          Generate HTML
        </Button>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-2">
        <Card className="p-4 min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Email Preview</h3>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-1" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
          </div>

          {previewMode ? (
            <div className="border rounded-lg p-6 bg-white" dangerouslySetInnerHTML={{ __html: generateHTML() }} />
          ) : (
            <div className="space-y-2">
              {blocks.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  Add components from the left to start building your email
                </p>
              ) : (
                blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={cn(
                      "border rounded-lg p-3 cursor-pointer hover:border-primary transition-colors",
                      selectedBlock === block.id && "border-primary bg-primary/5",
                    )}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1" dangerouslySetInnerHTML={{ __html: renderBlockHTML(block) }} />
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, "up")
                          }}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, "down")
                          }}
                          disabled={index === blocks.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBlock(block.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
