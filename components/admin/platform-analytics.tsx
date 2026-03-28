"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronRight,
  ChevronDown,
  Users,
  DollarSign,
  Heart,
  TrendingUp,
  FileText,
  Building2,
  MapPin,
  Globe,
} from "lucide-react"

interface Tenant {
  id: string
  subdomain: string
  full_name: string | null
  subscriberCount: number
}

interface AnalyticsData {
  topPages: { path: string; views: number }[]
  countries: { country: string; users: number }[]
  states: { state: string; users: number }[]
  cities: { city: string; users: number }[]
}

interface GivingStats {
  totalRaised: number
  monthlyRevenue: number
  donationCount: number
}

interface TenantData {
  analytics: AnalyticsData | null
  giving: GivingStats | null
  isLoading: boolean
  error: string | null
}

interface PlatformAnalyticsProps {
  tenants: Tenant[]
}

export function PlatformAnalytics({ tenants }: PlatformAnalyticsProps) {
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set())
  const [tenantData, setTenantData] = useState<Record<string, TenantData>>({})

  const toggleTenant = async (tenantId: string, subdomain: string) => {
    const newExpanded = new Set(expandedTenants)

    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId)
    } else {
      newExpanded.add(tenantId)

      // Only fetch if we haven't already
      if (!tenantData[tenantId]) {
        setTenantData((prev) => ({
          ...prev,
          [tenantId]: { analytics: null, giving: null, isLoading: true, error: null },
        }))

        try {
          const [analyticsRes, givingRes] = await Promise.all([
            fetch(`/api/analytics/tenant?subdomain=${subdomain}&days=30`),
            fetch(`/api/tenant/giving/stats?subdomain=${subdomain}`),
          ])

          const [analyticsData, givingData] = await Promise.all([
            analyticsRes.json(),
            givingRes.json(),
          ])

          setTenantData((prev) => ({
            ...prev,
            [tenantId]: {
              analytics: analyticsRes.ok ? analyticsData : null,
              giving: givingRes.ok ? givingData : null,
              isLoading: false,
              error: !analyticsRes.ok && !givingRes.ok ? "Failed to load data" : null,
            },
          }))
        } catch (err) {
          setTenantData((prev) => ({
            ...prev,
            [tenantId]: {
              analytics: null,
              giving: null,
              isLoading: false,
              error: "Failed to load data",
            },
          }))
        }
      }
    }

    setExpandedTenants(newExpanded)
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardContent className="p-0">
        {tenants.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No active tenants found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tenants.map((tenant) => {
              const isExpanded = expandedTenants.has(tenant.id)
              const data = tenantData[tenant.id]

              return (
                <div key={tenant.id}>
                  {/* Row Header */}
                  <button
                    onClick={() => toggleTenant(tenant.id, tenant.subdomain)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    style={{
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          {tenant.full_name || tenant.subdomain}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tenant.subdomain}.tektonstable.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      <Users className="h-3.5 w-3.5" />
                      {tenant.subscriberCount}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                      {data?.isLoading ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[...Array(4)].map((_, i) => (
                              <Skeleton key={i} className="h-20 w-full rounded-lg" />
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[...Array(4)].map((_, i) => (
                              <Skeleton key={i} className="h-48 w-full rounded-lg" />
                            ))}
                          </div>
                        </div>
                      ) : data?.error ? (
                        <div className="text-center py-4 text-red-500">{data.error}</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Section 1: Stat Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard
                              icon={<Users className="h-5 w-5" />}
                              label="Subscribers"
                              value={formatNumber(tenant.subscriberCount)}
                            />
                            <StatCard
                              icon={<DollarSign className="h-5 w-5" />}
                              label="Total Raised"
                              value={formatCurrency(data?.giving?.totalRaised || 0)}
                            />
                            <StatCard
                              icon={<TrendingUp className="h-5 w-5" />}
                              label="Monthly Revenue"
                              value={formatCurrency(data?.giving?.monthlyRevenue || 0)}
                            />
                            <StatCard
                              icon={<Heart className="h-5 w-5" />}
                              label="Supporters"
                              value={formatNumber(data?.giving?.donationCount || 0)}
                            />
                          </div>

                          {/* Section 2: List Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <ListCard
                              icon={<FileText className="h-4 w-4" />}
                              title="Top Blog Posts"
                              items={
                                data?.analytics?.topPages
                                  ?.filter(
                                    (p) =>
                                      p.path?.startsWith("/blog/") && p.path !== "/blog/"
                                  )
                                  .slice(0, 5)
                                  .map((p) => ({
                                    label: p.path
                                      .replace("/blog/", "")
                                      .replace(/-/g, " "),
                                    value: p.views,
                                  })) || []
                              }
                            />
                            <ListCard
                              icon={<Building2 className="h-4 w-4" />}
                              title="Top Cities"
                              items={
                                data?.analytics?.cities?.slice(0, 5).map((c) => ({
                                  label: c.city,
                                  value: c.users,
                                })) || []
                              }
                            />
                            <ListCard
                              icon={<MapPin className="h-4 w-4" />}
                              title="Top States"
                              items={
                                data?.analytics?.states?.slice(0, 5).map((s) => ({
                                  label: s.state,
                                  value: s.users,
                                })) || []
                              }
                            />
                            <ListCard
                              icon={<Globe className="h-4 w-4" />}
                              title="Top Countries"
                              items={
                                data?.analytics?.countries?.slice(0, 5).map((c) => ({
                                  label: c.country,
                                  value: c.users,
                                })) || []
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
          <div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ListCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: { label: string; value: number }[]
}) {
  const maxValue = items.length > 0 ? items[0].value : 1

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <span className="text-blue-600">{icon}</span>
          {title}
        </h4>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No data yet</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const percentage = (item.value / maxValue) * 100
              return (
                <div key={item.label || index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate max-w-[120px]" title={item.label}>
                      {item.label || "Unknown"}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {formatNumber(item.value)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
