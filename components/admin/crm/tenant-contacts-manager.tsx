"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Mail, DollarSign, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Tenant {
  id: string
  subdomain: string
  full_name: string
  subscriberCount: number
  supporterCount: number
  followerCount: number
}

interface Subscriber {
  email: string
  name: string | null
  created_at: string
  status: string
}

interface Supporter {
  name: string | null
  email: string
  total_given: number
  monthly_amount: number | null
  last_gift_at: string | null
  created_at: string
}

interface Follower {
  email: string
  name: string | null
  status: string
  created_at: string
}

interface ContactsData {
  subscribers: Subscriber[]
  supporters: Supporter[]
  followers: Follower[]
}

interface TenantContactsManagerProps {
  tenants: Tenant[]
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "subscribed" || status === "approved" || status === "active"
  const isPending = status === "pending"

  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "bg-green-50 text-green-700 border-green-200"
          : isPending
            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
      }
    >
      {status}
    </Badge>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function TenantRow({ tenant }: { tenant: Tenant }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ContactsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const totalCount = tenant.subscriberCount + tenant.supporterCount + tenant.followerCount

  const handleToggle = async () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)

    if (newOpen && !hasFetched) {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/admin/tenant-contacts?tenantId=${tenant.id}`)
        const json = await res.json()
        setData({
          subscribers: json.subscribers || [],
          supporters: json.supporters || [],
          followers: json.followers || [],
        })
        setHasFetched(true)
      } catch (error) {
        console.error("Failed to fetch tenant contacts:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <div className="font-semibold text-gray-900">{tenant.full_name}</div>
            <div className="text-sm text-gray-500">{tenant.subdomain}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Mail className="h-3 w-3" />
            {tenant.subscriberCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {tenant.supporterCount}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <UserCheck className="h-3 w-3" />
            {tenant.followerCount}
          </Badge>
          <Badge className="bg-blue-600 hover:bg-blue-600">{totalCount}</Badge>
        </div>
      </button>

      {isOpen && (
        <div className="border-t p-4 bg-gray-50 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : data ? (
            <>
              {/* Email Subscribers */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-blue-700 mb-3">
                  <Mail className="h-4 w-4" />
                  Email Subscribers ({data.subscribers.length})
                </h4>
                {data.subscribers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No subscribers yet.</p>
                ) : (
                  <div className="bg-white rounded border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-600">Name</th>
                          <th className="text-left p-3 font-medium text-gray-600">Email</th>
                          <th className="text-left p-3 font-medium text-gray-600">Joined</th>
                          <th className="text-left p-3 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.subscribers.map((s, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-3">{s.name || "—"}</td>
                            <td className="p-3">{s.email}</td>
                            <td className="p-3">{formatDate(s.created_at)}</td>
                            <td className="p-3">
                              <StatusBadge status={s.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial Supporters */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                  <DollarSign className="h-4 w-4" />
                  Financial Supporters ({data.supporters.length})
                </h4>
                {data.supporters.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No supporters yet.</p>
                ) : (
                  <div className="bg-white rounded border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-600">Name</th>
                          <th className="text-left p-3 font-medium text-gray-600">Email</th>
                          <th className="text-left p-3 font-medium text-gray-600">Total Given</th>
                          <th className="text-left p-3 font-medium text-gray-600">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.supporters.map((s, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-3">{s.name || "—"}</td>
                            <td className="p-3">{s.email}</td>
                            <td className="p-3">
                              {formatCurrency(s.total_given)}
                              {s.monthly_amount ? (
                                <span className="text-gray-500 ml-1">
                                  ({formatCurrency(s.monthly_amount)}/mo)
                                </span>
                              ) : null}
                            </td>
                            <td className="p-3">{formatDate(s.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Followers */}
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-purple-700 mb-3">
                  <UserCheck className="h-4 w-4" />
                  Followers ({data.followers.length})
                </h4>
                {data.followers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No followers yet.</p>
                ) : (
                  <div className="bg-white rounded border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-600">Name</th>
                          <th className="text-left p-3 font-medium text-gray-600">Email</th>
                          <th className="text-left p-3 font-medium text-gray-600">Joined</th>
                          <th className="text-left p-3 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.followers.map((f, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-3">{f.name || "—"}</td>
                            <td className="p-3">{f.email}</td>
                            <td className="p-3">{formatDate(f.created_at)}</td>
                            <td className="p-3">
                              <StatusBadge status={f.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function TenantContactsManager({ tenants }: TenantContactsManagerProps) {
  if (tenants.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No tenants found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tenants.map((tenant) => (
        <TenantRow key={tenant.id} tenant={tenant} />
      ))}
    </div>
  )
}
