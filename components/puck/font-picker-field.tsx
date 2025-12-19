"use client"

import { useState, useEffect } from "react"
import { FieldLabel } from "@measured/puck"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, Search, Type } from "lucide-react"
import { cn } from "@/lib/utils"

// Popular Google Fonts list
const GOOGLE_FONTS = [
  { name: "Default (Inherit)", value: "inherit" },
  { name: "Inter", value: "Inter" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Raleway", value: "Raleway" },
  { name: "Oswald", value: "Oswald" },
  { name: "Playfair Display", value: "Playfair Display" },
  { name: "Merriweather", value: "Merriweather" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Nunito", value: "Nunito" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Rubik", value: "Rubik" },
  { name: "Work Sans", value: "Work Sans" },
  { name: "Quicksand", value: "Quicksand" },
  { name: "Mulish", value: "Mulish" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Archivo", value: "Archivo" },
  { name: "DM Sans", value: "DM Sans" },
  { name: "Crimson Text", value: "Crimson Text" },
  { name: "Libre Baskerville", value: "Libre Baskerville" },
  { name: "Lora", value: "Lora" },
  { name: "PT Serif", value: "PT Serif" },
  { name: "Noto Sans", value: "Noto Sans" },
  { name: "Noto Serif", value: "Noto Serif" },
  { name: "Fira Sans", value: "Fira Sans" },
  { name: "Barlow", value: "Barlow" },
  { name: "Josefin Sans", value: "Josefin Sans" },
  { name: "Space Grotesk", value: "Space Grotesk" },
  { name: "Manrope", value: "Manrope" },
  { name: "Cabin", value: "Cabin" },
  { name: "Karla", value: "Karla" },
  { name: "Bitter", value: "Bitter" },
  { name: "Arvo", value: "Arvo" },
]

interface FontPickerFieldProps {
  field: { label?: string }
  name: string
  value: string
  onChange: (value: string) => void
}

export function FontPickerField({ field, name, value, onChange }: FontPickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  // Filter fonts based on search
  const filteredFonts = GOOGLE_FONTS.filter((font) => font.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Load Google Font dynamically
  const loadFont = (fontFamily: string) => {
    if (fontFamily === "inherit" || loadedFonts.has(fontFamily)) return

    const link = document.createElement("link")
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`
    link.rel = "stylesheet"
    document.head.appendChild(link)
    setLoadedFonts((prev) => new Set([...prev, fontFamily]))
  }

  // Load current font on mount
  useEffect(() => {
    if (value && value !== "inherit") {
      loadFont(value)
    }
  }, [value])

  const handleSelect = (fontValue: string) => {
    loadFont(fontValue)
    onChange(fontValue)
    setOpen(false)
  }

  const currentFont = GOOGLE_FONTS.find((f) => f.value === value)?.name || value || "Default (Inherit)"

  return (
    <FieldLabel label={field.label || "Font Family"}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-transparent"
            style={{ fontFamily: value !== "inherit" ? value : undefined }}
          >
            <span className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              {currentFont}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Font</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Font List */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredFonts.map((font) => {
              // Load font for preview
              if (font.value !== "inherit") {
                loadFont(font.value)
              }

              return (
                <button
                  key={font.value}
                  onClick={() => handleSelect(font.value)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    value === font.value ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <span className="text-lg" style={{ fontFamily: font.value !== "inherit" ? font.value : undefined }}>
                    {font.name}
                  </span>
                  {value === font.value && <Check className="h-4 w-4" />}
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </FieldLabel>
  )
}

// Factory function to create the custom field config
export const createFontPickerField = (label = "Font Family") => ({
  type: "custom" as const,
  label,
  ai: {
    schema: {
      type: "string",
      description: "Google Font family name (e.g., 'Inter', 'Roboto', 'Playfair Display')",
    },
  },
  render: ({ field, name, value, onChange }: any) => (
    <FontPickerField field={field} name={name} value={value || "inherit"} onChange={onChange} />
  ),
})

// Helper to generate Google Fonts link for SSR
export const getGoogleFontsLink = (fonts: string[]) => {
  const uniqueFonts = [...new Set(fonts.filter((f) => f && f !== "inherit"))]
  if (uniqueFonts.length === 0) return null

  const families = uniqueFonts.map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&")
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}
