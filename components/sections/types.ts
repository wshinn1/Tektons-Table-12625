// Section field types
export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "color"
  | "url"
  | "button"
  | "number"
  | "boolean"
  | "select"
  | "icon"
  | "array"

export interface FieldDefinition {
  key: string
  label: string
  type: FieldType
  defaultValue?: any
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[] // For select fields
  arrayItemSchema?: Record<string, FieldDefinition> // For array fields
}

export interface SectionTypeDefinition {
  type: string
  name: string
  description: string
  category: "hero" | "features" | "testimonials" | "cta" | "pricing" | "stats" | "content" | "gallery" | "custom"
  icon: string
  fields: FieldDefinition[]
  defaultStyles: Record<string, string>
}

export interface SectionData {
  id: string
  name: string
  description?: string
  section_type: string
  thumbnail_url?: string
  original_screenshot_url?: string
  fields: Record<string, any>
  styles: Record<string, string>
  html_preview?: string
  is_template: boolean
  category: string
  created_at: string
  updated_at: string
}

export interface SectionInstance {
  id: string
  section_id: string
  page_identifier: string
  position: number
  field_overrides: Record<string, any>
  is_visible: boolean
  section?: SectionData
}

export interface AIAnalysisResult {
  sectionType: string
  name: string
  description: string
  fields: Record<string, any>
  styles: Record<string, string>
  suggestedCategory: string
}
