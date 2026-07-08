"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface DashboardStats {
  programs: number
  activePrograms: number
  assets: number
  findings: number
  criticalFindings: number
  totalBounty: number
  paidFindings: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.dashboard,
    queryFn: () => api.get<DashboardStats>("/stats/dashboard"),
  })
}
