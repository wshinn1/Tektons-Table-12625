"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface EditableField {
  id: string
  label: string
  type: "text" | "textarea" | "image" | "color" | "button" | "link" | "number" | "boolean"
  defaultValue: string
  placeholder?: string
}

interface SectionFieldEditorProps {
  fields: EditableField[]
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
}

export function SectionFieldEditor({ fields, values, onChange }: SectionFieldEditorProps) {
  const updateField = (id: string, value: string) => {
    onChange({ ...values, [id]: value })
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <Label htmlFor={field.id} className="text-sm font-medium">
            {field.label}
            <span className="ml-2 text-xs text-muted-foreground capitalize">({field.type})</span>
          </Label>

          {field.type === "textarea" ? (
            <Textarea
              id={field.id}
              value={values[field.id] || ""}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1"
              rows={3}
            />
          ) : field.type === "color" ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id={field.id}
                value={values[field.id] || "#000000"}
                onChange={(e) => updateField(field.id, e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={values[field.id] || ""}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          ) : field.type === "boolean" ? (
            <div className="flex items-center gap-2 mt-1">
              <Switch
                id={field.id}
                checked={values[field.id] === "true"}
                onCheckedChange={(checked) => updateField(field.id, checked ? "true" : "false")}
              />
              <Label htmlFor={field.id} className="text-sm text-muted-foreground">
                {values[field.id] === "true" ? "Enabled" : "Disabled"}
              </Label>
            </div>
          ) : field.type === "number" ? (
            <Input
              id={field.id}
              type="number"
              value={values[field.id] || ""}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1"
            />
          ) : field.type === "image" ? (
            <div className="space-y-2 mt-1">
              <Input
                id={field.id}
                value={values[field.id] || ""}
                onChange={(e) => updateField(field.id, e.target.value)}
                placeholder="Image URL..."
              />
              {values[field.id] && (
                <img src={values[field.id] || "/placeholder.svg"} alt="Preview" className="max-h-24 rounded border" />
              )}
            </div>
          ) : (
            <Input
              id={field.id}
              value={values[field.id] || ""}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1"
            />
          )}
        </div>
      ))}

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No editable fields detected</p>
      )}
    </div>
  )
}
