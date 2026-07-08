"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface BountyStats {
  totalEarned: number
  pendingAmount: number
  paidThisMonth: number
  recentPaid: Array<{
    id: number
    title: string
    severity: string
    rewardAmount: number
    updatedAt: string
  }>
}

export function useBountyStats() {
  return useQuery({
    queryKey: queryKeys.stats.bounty,
    queryFn: () => api.get<BountyStats>("/stats/bounty"),
  })
}
