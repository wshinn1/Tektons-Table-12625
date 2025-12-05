import { LearnMoreForm } from "@/components/learn-more-form"

export const metadata = {
  title: "Learn More About Tekton's Table",
  description: "Discover how Tekton's Table can help missionaries raise support online",
}

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-balance">Empower Your Mission with Tekton's Table</h1>
          <p className="text-xl text-muted-foreground text-balance">
            The all-in-one platform for missionaries to build beautiful fundraising websites and manage donor
            relationships
          </p>
        </div>

        <LearnMoreForm />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">$0</div>
            <div className="text-sm text-muted-foreground">Setup Cost</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">5 min</div>
            <div className="text-sm text-muted-foreground">To Launch</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Donation Processing</div>
          </div>
        </div>
      </div>
    </div>
  )
}
