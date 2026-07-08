"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface Finding {
  id: number
  uuid: string
  assetId: number
  title: string
  severity: string
  status: string
  poc: string | null
  rewardAmount: number | null
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export function useFindings(
  assetId?: number,
  offset = 0,
  limit = 50,
  assetUuid?: string,
) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  })
  if (assetUuid) params.set("assetUuid", assetUuid)
  else if (assetId) params.set("assetId", String(assetId))

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: assetUuid
      ? queryKeys.findings.byAsset(assetUuid)
      : queryKeys.findings.list(assetId, offset, limit),
    queryFn: () =>
      api.get<PaginatedResponse<Finding>>(`/findings?${params}`),
  })

  return {
    findings: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}
