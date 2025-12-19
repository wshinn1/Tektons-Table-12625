"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { FieldLabel } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Pipette } from "lucide-react"
import { cn } from "@/lib/utils"

// Preset colors
const PRESET_COLORS = [
  // Neutrals
  "#000000",
  "#1a1a1a",
  "#333333",
  "#4d4d4d",
  "#666666",
  "#808080",
  "#999999",
  "#b3b3b3",
  "#cccccc",
  "#e6e6e6",
  "#f2f2f2",
  "#ffffff",
  // Blues
  "#0066cc",
  "#0099ff",
  "#3366cc",
  "#1e40af",
  "#3b82f6",
  "#60a5fa",
  // Greens
  "#059669",
  "#10b981",
  "#22c55e",
  "#15803d",
  "#16a34a",
  "#4ade80",
  // Reds
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#b91c1c",
  "#991b1b",
  "#fca5a5",
  // Yellows/Oranges
  "#f59e0b",
  "#fbbf24",
  "#fcd34d",
  "#d97706",
  "#ea580c",
  "#f97316",
  // Purples
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#6d28d9",
  "#9333ea",
  "#c084fc",
  // Pinks
  "#db2777",
  "#ec4899",
  "#f472b6",
  "#be185d",
  "#e11d48",
  "#f43f5e",
]

interface ColorPickerFieldProps {
  field: { label?: string }
  name: string
  value: string
  onChange: (value: string) => void
}

export function ColorPickerField({ field, name, value, onChange }: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || "")
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    // Only update if it looks like a valid color
    if (
      newValue.match(/^#[0-9A-Fa-f]{6}$/) ||
      newValue.match(/^#[0-9A-Fa-f]{3}$/) ||
      newValue.match(/^rgb/i) ||
      newValue === ""
    ) {
      onChange(newValue)
    }
  }

  const handleInputBlur = () => {
    onChange(inputValue)
  }

  const handlePresetClick = (color: string) => {
    setInputValue(color)
    onChange(color)
  }

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setInputValue(color)
    onChange(color)
  }

  return (
    <FieldLabel label={field.label || "Color"}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: value || "#ffffff" }} />
            <span className="flex-1 text-left font-mono text-sm">{value || "No color"}</span>
            <Pipette className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-4">
            {/* Hex Input + Native Color Picker */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="font-mono flex-1"
              />
              <div className="relative">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={value || "#000000"}
                  onChange={handleNativePickerChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                />
                <Button variant="outline" size="icon" className="pointer-events-none bg-transparent">
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: value || "#000000" }} />
                </Button>
              </div>
            </div>

            {/* Clear button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setInputValue("")
                onChange("")
              }}
            >
              Clear Color
            </Button>

            {/* Preset Colors */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Preset Colors</p>
              <div className="grid grid-cols-12 gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      "w-5 h-5 rounded border transition-transform hover:scale-110",
                      value === color ? "ring-2 ring-primary ring-offset-1" : "border-border",
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FieldLabel>
  )
}

// Factory function to create the custom field config
export const createColorPickerField = (label = "Color") => ({
  type: "custom" as const,
  label,
  ai: {
    schema: {
      type: "string",
      description: "Hex color code (e.g., '#ff0000' for red, '#000000' for black)",
    },
  },
  render: ({ field, name, value, onChange }: any) => (
    <ColorPickerField field={field} name={name} value={value || ""} onChange={onChange} />
  ),
})
