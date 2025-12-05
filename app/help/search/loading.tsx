import { Skeleton } from "@/components/ui/skeleton"
import { MarketingNav } from "@/components/marketing-nav"

export default function HelpSearchLoading() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <div className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-80 mb-6" />
          <Skeleton className="h-12 w-full max-w-2xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  )
}
