"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  updateFooterSettings,
  type FooterSettings,
  type FooterColumn,
  type FooterLink,
} from "@/app/actions/footer-settings"
import { Loader2, Plus, Trash2, Link2 } from "lucide-react"
import { toast } from "sonner"

const PLATFORM_PAGES = [
  { label: "Home", url: "/" },
  { label: "About", url: "/about" },
  { label: "How It Works", url: "/how-it-works" },
  { label: "Pricing", url: "/pricing" },
  { label: "Features", url: "/features" },
  { label: "Security", url: "/security" },
  { label: "Blog", url: "/blog" },
  { label: "Resources", url: "/resources" },
  { label: "Contact", url: "/contact" },
  { label: "Support", url: "/support" },
  { label: "Login", url: "/auth/login" },
  { label: "Sign Up", url: "/auth/signup" },
  { label: "Terms", url: "/terms" },
  { label: "Privacy", url: "/privacy" },
  { label: "Example Site", url: "/example" },
] as const

export function FooterSettingsForm({ settings }: { settings: FooterSettings }) {
  const [loading, setLoading] = useState(false)
  const [siteTitle, setSiteTitle] = useState(settings.site_title)
  const [siteSubtitle, setSiteSubtitle] = useState(settings.site_subtitle)
  const [copyrightText, setCopyrightText] = useState(settings.copyright_text)
  const [menuColumns, setMenuColumns] = useState<FooterColumn[]>(settings.menu_columns)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateFooterSettings({
        id: settings.id,
        site_title: siteTitle,
        site_subtitle: siteSubtitle,
        copyright_text: copyrightText,
        menu_columns: menuColumns,
      })

      if (result.success) {
        toast.success("Footer settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update footer settings")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addColumn = () => {
    setMenuColumns([...menuColumns, { title: "New Column", links: [] }])
  }

  const removeColumn = (index: number) => {
    setMenuColumns(menuColumns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, updates: Partial<FooterColumn>) => {
    const updated = [...menuColumns]
    updated[index] = { ...updated[index], ...updates }
    setMenuColumns(updated)
  }

  const addLink = (columnIndex: number) => {
    const updated = [...menuColumns]
    updated[columnIndex].links.push({ label: "New Link", url: "/" })
    setMenuColumns(updated)
  }

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const updated = [...menuColumns]
    updated[columnIndex].links = updated[columnIndex].links.filter((_, i) => i !== linkIndex)
    setMenuColumns(updated)
  }

  const updateLink = (columnIndex: number, linkIndex: number, updates: Partial<FooterLink>) => {
    const updated = [...menuColumns]
    updated[columnIndex].links[linkIndex] = { ...updated[columnIndex].links[linkIndex], ...updates }
    setMenuColumns(updated)
  }

  const selectPage = (columnIndex: number, linkIndex: number, pageUrl: string) => {
    const page = PLATFORM_PAGES.find((p) => p.url === pageUrl)
    if (page) {
      updateLink(columnIndex, linkIndex, { label: page.label, url: page.url })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>Update your site title and subtitle displayed in the footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Tekton's Table"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteSubtitle">Site Subtitle</Label>
            <Textarea
              id="siteSubtitle"
              value={siteSubtitle}
              onChange={(e) => setSiteSubtitle(e.target.value)}
              placeholder="Built by storytellers for storytellers in God's kingdom."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer Menu Columns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Footer Navigation</CardTitle>
              <CardDescription>Manage your footer menu columns and links</CardDescription>
            </div>
            <Button type="button" onClick={addColumn} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {menuColumns.map((column, columnIndex) => (
            <Card key={columnIndex} className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Column Title</Label>
                    <Input
                      value={column.title}
                      onChange={(e) => updateColumn(columnIndex, { title: e.target.value })}
                      placeholder="Column Title"
                    />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeColumn(columnIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="space-y-3 p-3 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs text-muted-foreground">Quick Select Page (optional)</Label>
                    </div>
                    <Select onValueChange={(value) => selectPage(columnIndex, linkIndex, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a platform page..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_PAGES.map((page) => (
                          <SelectItem key={page.url} value={page.url}>
                            {page.label} ({page.url})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Label</Label>
                        <Input
                          value={link.label}
                          onChange={(e) => updateLink(columnIndex, linkIndex, { label: e.target.value })}
                          placeholder="Link Label"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={link.url}
                          onChange={(e) => updateLink(columnIndex, linkIndex, { url: e.target.value })}
                          placeholder="/page-url"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(columnIndex, linkIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLink(columnIndex)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Copyright Text */}
      <Card>
        <CardHeader>
          <CardTitle>Copyright Text</CardTitle>
          <CardDescription>Customize the copyright text at the bottom of the footer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright Text</Label>
            <Input
              id="copyrightText"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              placeholder="Tekton's Table. All rights reserved."
            />
            <p className="text-sm text-muted-foreground">
              The year will be automatically added. Current preview: © {new Date().getFullYear()} {copyrightText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Footer Settings
        </Button>
      </div>
    </form>
  )
}
