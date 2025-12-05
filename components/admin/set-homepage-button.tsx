"use client"

import { Button } from "@/components/ui/button"
import { setAsHomepage } from "@/app/actions/pages"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface SetHomepageButtonProps {
  pageId: string
  pageTitle: string
}

export function SetHomepageButton({ pageId, pageTitle }: SetHomepageButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSetAsHomepage = async () => {
    setIsLoading(true)
    try {
      await setAsHomepage(pageId)
      toast({
        title: "Homepage updated",
        description: `"${pageTitle}" is now set as the homepage.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set page as homepage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleSetAsHomepage} disabled={isLoading}>
      {isLoading ? "Setting..." : "Set as Homepage"}
    </Button>
  )
}
