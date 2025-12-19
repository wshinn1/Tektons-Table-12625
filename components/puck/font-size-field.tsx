"use client"

import type React from "react"

import { FieldLabel } from "@measured/puck"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface FontSizeFieldProps {
  field: { label?: string }
  name: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function FontSizeField({ field, name, value, onChange, min = 8, max = 144, step = 1 }: FontSizeFieldProps) {
  const handleIncrement = () => {
    const newValue = Math.min(max, (value || 16) + step)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min, (value || 16) - step)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <FieldLabel label={field.label || "Font Size (pt)"}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 bg-transparent" onClick={handleDecrement}>
          <Minus className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <Input
            type="number"
            value={value || 16}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="pr-8 text-center"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">pt</span>
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 bg-transparent" onClick={handleIncrement}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </FieldLabel>
  )
}

// Factory function to create the custom field config
export const createFontSizeField = (label = "Font Size (pt)", defaultValue = 16) => ({
  type: "custom" as const,
  label,
  ai: {
    schema: {
      type: "number",
      description: "Font size in points (pt). Common values: 12pt for body, 24pt for headings, 48pt for titles",
    },
  },
  render: ({ field, name, value, onChange }: any) => (
    <FontSizeField field={field} name={name} value={value ?? defaultValue} onChange={onChange} />
  ),
})
