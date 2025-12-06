"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Heart } from "lucide-react"

export function SubscribeCTA({ tenantName, tenantSlug }: { tenantName: string; tenantSlug: string }) {
  return (
    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 border-0 shadow-lg">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 text-white">Want more content like this?</h3>
            <p className="text-sm text-blue-100 mb-4">
              Subscribe to get updates delivered to your inbox and support {tenantName}'s mission.
            </p>
            <div className="flex gap-3">
              <Button asChild size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
                <Link href={`/subscribe`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/50 text-white hover:bg-white/10 hover:text-white bg-transparent"
              >
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
