import type React from "react"
import { SupporterSidebar } from "@/components/supporter/supporter-sidebar"

// Auth checks are now handled in each individual page
export default function SupporterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <SupporterSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
