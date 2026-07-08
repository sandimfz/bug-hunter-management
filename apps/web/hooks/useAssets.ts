"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface Asset {
  id: number
  uuid: string
  programId: number
  type: string
  value: string
  status: string
  tags: string[] | null
  notes: string | null
  method: string | null
  requestHeaders: Record<string, string> | null
  requestBody: string | null
  responseStatus: number | null
  responseHeaders: Record<string, string> | null
  responseBody: string | null
  contentType: string | null
  firstSeenAt: string
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export function useAssets(programId?: number, offset = 0, limit = 50) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  })
  if (programId) params.set("programId", String(programId))

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.assets.list(programId, offset, limit),
    queryFn: () =>
      api.get<PaginatedResponse<Asset>>(`/assets?${params}`),
  })

  return {
    assets: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}
