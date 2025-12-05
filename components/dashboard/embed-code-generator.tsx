"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, Copy, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmbedCodeGeneratorProps {
  subdomain: string
}

export function EmbedCodeGenerator({ subdomain }: EmbedCodeGeneratorProps) {
  const [height, setHeight] = useState("800")
  const [copied, setCopied] = useState(false)

  const iframeEmbedCode = `<!-- Tektons Table Embed Code -->
<div id="tektonstable-embed-container" style="width: 100%; min-width: 1024px; overflow-x: auto;">
  <iframe
    id="tektonstable-embed"
    src="https://${subdomain}.tektonstable.com?embed=true"
    style="width: 100%; min-width: 1024px; min-height: ${height}px; border: none; overflow: hidden;"
    scrolling="no"
    frameborder="0"
    allowfullscreen
  ></iframe>
</div>
<script>
(function() {
  var iframe = document.getElementById('tektonstable-embed');
  
  function resizeIframe() {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'getHeight' }, '*');
    }
  }
  
  window.addEventListener('message', function(e) {
    if (e.data.type === 'setHeight' && iframe) {
      iframe.style.height = Math.max(e.data.height, ${height}) + 'px';
    }
  });
  
  iframe.addEventListener('load', resizeIframe);
  window.addEventListener('resize', resizeIframe);
  resizeIframe();
})();
</script>
<!-- End Tektons Table Embed Code -->`

  const wordpressEmbedCode = `<!-- Add this to your WordPress page/post HTML block -->
<!-- Important: Use a full-width page template for best results -->
<div style="width: 100%; min-width: 1024px; overflow-x: auto; margin: 0 auto;">
  <iframe
    src="https://${subdomain}.tektonstable.com?embed=true"
    style="width: 100%; min-width: 1024px; height: ${height}px; border: none;"
    scrolling="auto"
    allowfullscreen
  ></iframe>
</div>

<!-- Alternative: Responsive wrapper that scrolls on mobile -->
<style>
.tektonstable-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tektonstable-wrapper iframe {
  width: 1024px;
  min-width: 1024px;
  height: ${height}px;
  border: none;
}
@media (min-width: 1024px) {
  .tektonstable-wrapper iframe {
    width: 100%;
  }
}
</style>
<div class="tektonstable-wrapper">
  <iframe src="https://${subdomain}.tektonstable.com?embed=true" allowfullscreen></iframe>
</div>`

  const directLinkCode = `https://${subdomain}.tektonstable.com`

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          The embed requires a <strong>minimum width of 1024px</strong> to display the desktop layout properly. On
          smaller screens, the embed will be scrollable horizontally.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="height">Minimum Height (pixels)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The iframe will auto-expand if content is taller than this value.
          </p>
        </div>
      </div>

      <Tabs defaultValue="wordpress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          <TabsTrigger value="iframe">Standard Iframe</TabsTrigger>
          <TabsTrigger value="link">Direct Link</TabsTrigger>
        </TabsList>

        <TabsContent value="wordpress" className="space-y-2">
          <Label>WordPress Embed Code</Label>
          <div className="relative">
            <Textarea value={wordpressEmbedCode} readOnly className="font-mono text-xs h-64 resize-none" />
            <Button
              onClick={() => handleCopy(wordpressEmbedCode)}
              size="sm"
              className="absolute top-2 right-2"
              variant={copied ? "default" : "secondary"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste into a Custom HTML block. Use a full-width page template for best results. The embed will be
            horizontally scrollable on mobile devices.
          </p>
        </TabsContent>

        <TabsContent value="iframe" className="space-y-2">
          <Label>Standard Iframe Embed Code</Label>
          <div className="relative">
            <Textarea value={iframeEmbedCode} readOnly className="font-mono text-xs h-64 resize-none" />
            <Button
              onClick={() => handleCopy(iframeEmbedCode)}
              size="sm"
              className="absolute top-2 right-2"
              variant={copied ? "default" : "secondary"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this for any website. Includes auto-resize script for dynamic content height.
          </p>
        </TabsContent>

        <TabsContent value="link" className="space-y-2">
          <Label>Direct Link</Label>
          <div className="relative">
            <Input value={directLinkCode} readOnly className="font-mono text-sm pr-20" />
            <Button
              onClick={() => handleCopy(directLinkCode)}
              size="sm"
              className="absolute top-1 right-1"
              variant={copied ? "default" : "secondary"}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this link to open the site directly or add as a menu link.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
