export default function ExampleTenantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Example Tenant Site</h1>
        <p className="text-gray-600 mt-1">
          Live preview of a tenant site. This demonstrates how a ministry or organization's site looks when fully
          configured.
        </p>
      </div>

      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <iframe
          src="https://wesshinn.tektonstable.com/"
          className="w-full h-full"
          title="Example Tenant Site - Wes Shinn"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  )
}
