import type { Metadata } from "next"
import { MarketingNav } from "@/components/marketing-nav"
import { SupportPageContent } from "./_client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Support | Tekton's Table",
  description: "Get help with Tekton's Table. Ask our AI assistant or browse help resources.",
}

export default async function SupportPage() {
  console.log("[v0] SupportPage: Rendering support page")

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <SupportPageContent />
    </div>
  )
}
