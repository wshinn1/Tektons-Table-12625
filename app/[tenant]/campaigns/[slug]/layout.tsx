import type React from "react"
import { CampaignErrorBoundary } from "@/components/campaign-error-boundary"

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return <CampaignErrorBoundary>{children}</CampaignErrorBoundary>
}
