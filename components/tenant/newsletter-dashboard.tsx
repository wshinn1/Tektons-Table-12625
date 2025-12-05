"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsletterComposer } from "./newsletter-composer"
import { SubscribersList } from "./subscribers-list"
import { NewslettersList } from "./newsletters-list"

export function NewsletterDashboard({ tenantId }: { tenantId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Newsletter</h1>
        <p className="text-muted-foreground mt-2">Create and send newsletters to your subscribers</p>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent Newsletters</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <NewsletterComposer tenantId={tenantId} />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <NewslettersList tenantId={tenantId} statusFilter="draft" />
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <NewslettersList tenantId={tenantId} statusFilter="sent" />
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <SubscribersList tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
