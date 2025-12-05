import { MarketingNav } from "@/components/marketing-nav"
import { getPageMetadata } from "@/lib/get-page-metadata"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

export async function generateMetadata() {
  return (
    (await getPageMetadata("example")) || {
      title: "Example Tenant Site - Tekton's Table",
      description: "See a live example of a missionary fundraising site built on Tekton's Table",
    }
  )
}

export default function ExamplePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="hidden md:block">
        <MarketingNav />
      </div>

      <div className="md:hidden sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tekton's Table
          </Link>
          <Link
            href="/auth/signup"
            className="text-xs bg-accent text-white px-3 py-1.5 rounded-full font-medium hover:bg-accent/90 transition-colors"
          >
            Create Your Site
          </Link>
        </div>
      </div>

      {/* Info banner - Desktop only */}
      <div className="hidden md:block bg-accent/10 border-b border-accent/20 py-3 px-4 text-center">
        <p className="text-sm text-foreground/80">
          <span className="font-semibold">Live Example:</span> This is a real missionary site built on Tekton's Table.
          <a href="/auth/signup" className="text-accent hover:underline font-medium ml-2">
            Create your own site →
          </a>
        </p>
      </div>

      <div className="md:hidden bg-accent/10 border-b border-accent/20 py-2 px-4 text-center">
        <p className="text-xs text-foreground/80">
          <span className="font-medium">Live Example</span> - Scroll to explore this missionary site
        </p>
      </div>

      <div className="flex-1 relative">
        <iframe
          src="https://wesshinn.tektonstable.com/"
          className="w-full border-0 min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-120px)]"
          style={{ height: "calc(100vh - 100px)" }}
          title="Example Tenant Site - Wes Shinn"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>

      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <a
          href="https://wesshinn.tektonstable.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-foreground/90 text-background text-xs px-3 py-2 rounded-full shadow-lg backdrop-blur-sm"
        >
          <ExternalLink className="h-3 w-3" />
          Open in new tab
        </a>
      </div>
    </div>
  )
}
