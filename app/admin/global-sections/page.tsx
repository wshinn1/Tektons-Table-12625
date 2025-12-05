import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GlobalSectionsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Sections</h1>
          <p className="text-gray-500 mt-1">
            Manage sections that appear across multiple pages (headers, footers, CTAs)
          </p>
        </div>
        <Button>Create Global Section</Button>
      </div>

      <div className="grid gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Main Header</h3>
              <p className="text-sm text-gray-500 mt-1">Navigation bar with logo and menu</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-600">Used on: 12 pages</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Footer</h3>
              <p className="text-sm text-gray-500 mt-1">Site footer with links and contact info</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-600">Used on: All pages</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Donation CTA</h3>
              <p className="text-sm text-gray-500 mt-1">Call-to-action banner for donations</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-600">Used on: 5 pages</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
