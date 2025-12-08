"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, Search, Globe, FileText } from "lucide-react"

export default function SEOSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    keywords: "",
    allow_search_indexing: true,
    og_image_url: "",
    twitter_handle: "",
    google_site_verification: "",
    bing_site_verification: "",
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // TODO: Implement save functionality
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("SEO settings saved successfully")
    } catch (error) {
      toast.error("Failed to save SEO settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Settings</h1>
        <p className="text-muted-foreground">Optimize your site for search engines and social media</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Basic SEO
          </CardTitle>
          <CardDescription>Control how your site appears in search results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              placeholder="Long Term Funding Support"
              value={settings.site_title}
              onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Appears in browser tabs and search results (50-60 characters recommended)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              placeholder="Support missionaries and ministries with recurring donations"
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">Appears in search results (150-160 characters recommended)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              placeholder="missionary, fundraising, donations, ministry"
              value={settings.keywords}
              onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Comma-separated keywords (optional, for reference)</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="indexing">Allow Search Engine Indexing</Label>
              <p className="text-sm text-muted-foreground">Let search engines like Google index your site</p>
            </div>
            <Switch
              id="indexing"
              checked={settings.allow_search_indexing}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_search_indexing: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Media
          </CardTitle>
          <CardDescription>Control how your site appears when shared on social platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og_image">Social Sharing Image URL</Label>
            <Input
              id="og_image"
              type="url"
              placeholder="https://..."
              value={settings.og_image_url}
              onChange={(e) => setSettings({ ...settings, og_image_url: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Image shown when sharing on Facebook, Twitter, LinkedIn (1200x630px recommended)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_handle">Twitter Handle</Label>
            <Input
              id="twitter_handle"
              placeholder="@yourusername"
              value={settings.twitter_handle}
              onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Your Twitter username (optional)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Site Verification
          </CardTitle>
          <CardDescription>Verify ownership with search engines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_verification">Google Search Console Verification Code</Label>
            <Input
              id="google_verification"
              placeholder="abc123..."
              value={settings.google_site_verification}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  google_site_verification: e.target.value,
                })
              }
            />
            <p className="text-sm text-muted-foreground">Meta tag content value from Google Search Console</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bing_verification">Bing Webmaster Tools Verification Code</Label>
            <Input
              id="bing_verification"
              placeholder="abc123..."
              value={settings.bing_site_verification}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bing_site_verification: e.target.value,
                })
              }
            />
            <p className="text-sm text-muted-foreground">Meta tag content value from Bing Webmaster Tools</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save SEO Settings
        </Button>
      </div>
    </div>
  )
}
