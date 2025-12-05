"use client"

import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface EasyEmailVisualEditorProps {
  initialHtml?: string
  initialDesign?: any
  onChange: (html: string, design: any) => void
}

export function EasyEmailVisualEditor({ initialHtml = "", initialDesign, onChange }: EasyEmailVisualEditorProps) {
  return (
    <Card className="p-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-2">Visual Editor Not Available</p>
          <p className="text-sm mb-3">
            The drag-and-drop visual email editor is currently unavailable. Please use the <strong>HTML Editor</strong>{" "}
            tab to compose your newsletters.
          </p>
          <p className="text-sm text-muted-foreground">
            The HTML Editor provides a professional email template that you can customize with your content.
          </p>
        </AlertDescription>
      </Alert>
    </Card>
  )
}
