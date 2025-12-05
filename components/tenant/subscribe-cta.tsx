"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Heart } from "lucide-react"

export function SubscribeCTA({ tenantName, tenantSlug }: { tenantName: string; tenantSlug: string }) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Want more content like this?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get updates delivered to your inbox and support {tenantName}'s mission.
            </p>
            <div className="flex gap-3">
              <Button asChild size="sm">
                <Link href={`/subscribe`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/giving`}>
                  <Heart className="h-4 w-4 mr-2" />
                  Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
