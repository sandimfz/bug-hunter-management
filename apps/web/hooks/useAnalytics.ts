"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface AnalyticsData {
  severityCounts: Record<string, number>
  statusCounts: Record<string, number>
  assetTypeCounts: Record<string, number>
  bountyByMonth: Array<{ month: string; total: number }>
  assetsByMonth: Array<{ month: string; total: number }>
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.stats.analytics,
    queryFn: () => api.get<AnalyticsData>("/stats/analytics"),
  })
}
