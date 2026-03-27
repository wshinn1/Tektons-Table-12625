"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Users,
  Globe,
  MapPin,
  Building2,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface AnalyticsData {
  pageviews: number
  sessions: number
  countries: { country: string; users: number }[]
  states: { state: string; users: number }[]
  cities: { city: string; users: number }[]
  topPages: { path: string; views: number }[]
  dailyViews: { date: string; views: number }[]
  recentVisitors: {
    distinct_id: string
    city: string
    country: string
    last_seen: string
  }[]
  locations: { lat: number; lng: number; city: string; users: number }[]
  countryCount: number
  stateCount: number
  cityCount: number
  period: number
}

type TimePeriod = 1 | 7 | 14 | 30

const periodLabels: Record<TimePeriod, string> = {
  1: "24h",
  7: "7 days",
  14: "14 days",
  30: "30 days",
}

export default function TenantAnalyticsDashboard() {
  const params = useParams()
  const subdomain = params.tenant as string

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(7)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null)
  const [mapPosition, setMapPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  })

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/analytics/tenant?subdomain=${subdomain}&days=${selectedPeriod}&_t=${Date.now()}`,
        { cache: "no-store" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch analytics")
      setAnalytics(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("[Analytics] Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to load analytics data.")
    } finally {
      setIsLoading(false)
    }
  }, [subdomain, selectedPeriod])

  useEffect(() => {
    fetchAnalytics()
    autoRefreshRef.current = setInterval(() => {
      fetchAnalytics(true) // silent – keeps existing data visible
    }, 60_000)
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
  }, [fetchAnalytics])

  const handleZoom = useCallback((event: any) => {
    // Allow wheel zoom on map
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Site Analytics</h1>
          <p className="text-gray-500 mt-1">
            Track visitor activity and engagement metrics
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics()} disabled={isLoading} className="text-gray-600">
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
          {([1, 7, 14, 30] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "bg-blue-600 text-white" : "text-gray-600"}
            >
              {periodLabels[period]}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Page Views"
          value={analytics?.pageviews}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Sessions"
          value={analytics?.sessions}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Globe className="h-5 w-5" />}
          label="Countries"
          value={analytics?.countryCount}
          isLoading={isLoading}
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="States"
          value={analytics?.stateCount}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Cities"
          value={analytics?.cityCount}
          isLoading={isLoading}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Users By Country Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Users By Country
          </CardTitle>
          <CardDescription>Geographic distribution of your visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* World Map */}
            <div className="lg:col-span-2 bg-slate-50 rounded-lg overflow-hidden h-[400px]">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 120,
                    center: [0, 30],
                  }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <ZoomableGroup
                    center={mapPosition.coordinates}
                    zoom={mapPosition.zoom}
                    onMoveEnd={(position) => setMapPosition(position)}
                    minZoom={1}
                    maxZoom={8}
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#E2E8F0"
                            stroke="#CBD5E1"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { fill: "#CBD5E1", outline: "none" },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>
                    {analytics?.locations.map((location, index) => (
                      <Marker
                        key={`${location.lat}-${location.lng}-${index}`}
                        coordinates={[location.lng, location.lat]}
                      >
                        <circle
                          r={Math.min(3 + Math.log2(location.users + 1) * 2, 12)}
                          fill="#3B82F6"
                          fillOpacity={0.6}
                          stroke="#1D4ED8"
                          strokeWidth={1}
                        />
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
              )}
            </div>

            {/* Country & State Lists */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Top Countries
                </h4>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : analytics?.countries.length === 0 ? (
                  <p className="text-sm text-gray-500">No data available</p>
                ) : (
                  <div className="space-y-2">
                    {analytics?.countries.slice(0, 5).map((item, index) => (
                      <div
                        key={item.country || index}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.country || "Unknown"}
                        </span>
                        <Badge variant="secondary">{formatNumber(item.users)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Top States
                </h4>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : analytics?.states.length === 0 ? (
                  <p className="text-sm text-gray-500">No data available</p>
                ) : (
                  <div className="space-y-2">
                    {analytics?.states.slice(0, 5).map((item, index) => (
                      <div
                        key={item.state || index}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.state || "Unknown"}
                        </span>
                        <Badge variant="secondary">{formatNumber(item.users)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : analytics?.cities.length === 0 ? (
              <p className="text-sm text-gray-500">No data available</p>
            ) : (
              <div className="space-y-2">
                {analytics?.cities.slice(0, 5).map((item, index) => (
                  <div
                    key={item.city || index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 truncate">{item.city || "Unknown"}</span>
                    <span className="text-gray-500 font-medium">{formatNumber(item.users)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audience Metrics with mini sparklines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Audience Metrics
              <Badge variant="outline" className="ml-auto text-xs">
                {periodLabels[selectedPeriod]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <MetricWithSparkline
                  label="Page Views"
                  value={analytics?.pageviews || 0}
                  data={analytics?.dailyViews || []}
                  dataKey="views"
                />
                <MetricWithSparkline
                  label="Countries"
                  value={analytics?.countryCount || 0}
                  data={[]}
                  dataKey="count"
                />
                <MetricWithSparkline
                  label="Cities"
                  value={analytics?.cityCount || 0}
                  data={[]}
                  dataKey="count"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : analytics?.topPages.length === 0 ? (
              <p className="text-sm text-gray-500">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics?.topPages.slice(0, 5).map((page, index) => {
                  const maxViews = analytics.topPages[0]?.views || 1
                  const percentage = (page.views / maxViews) * 100
                  return (
                    <div key={page.path || index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[150px]" title={page.path}>
                          {page.path || "/"}
                        </span>
                        <span className="text-gray-500 font-medium">{formatNumber(page.views)}</span>
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

        {/* Recent Visitors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Recent Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : analytics?.recentVisitors.length === 0 ? (
              <p className="text-sm text-gray-500">No recent visitors</p>
            ) : (
              <div className="space-y-3">
                {analytics?.recentVisitors.slice(0, 5).map((visitor, index) => (
                  <div
                    key={visitor.distinct_id || index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {visitor.city || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {visitor.country || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTimestamp(visitor.last_seen)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Traffic Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Traffic Overview
          </CardTitle>
          <CardDescription>
            Daily page views over the past {periodLabels[selectedPeriod]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : analytics?.dailyViews.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No traffic data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={analytics?.dailyViews || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value: number) => [formatNumber(value), "Views"]}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  isLoading,
  className = "",
}: {
  icon: React.ReactNode
  label: string
  value?: number
  isLoading: boolean
  className?: string
}) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
          <div>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {formatNumber(value || 0)}
              </p>
            )}
            <p className="text-xs md:text-sm text-gray-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Metric with Sparkline Component
function MetricWithSparkline({
  label,
  value,
  data,
  dataKey,
}: {
  label: string
  value: number
  data: any[]
  dataKey: string
}) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{formatNumber(value)}</p>
      </div>
      {data.length > 0 && (
        <div className="w-20 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
