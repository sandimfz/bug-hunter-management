"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface Program {
  id: number
  uuid: string
  workspaceId: number
  name: string
  platform: string
  status: string
  scopeNotes: string | null
  createdAt: string
  updatedAt: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export function usePrograms(offset = 0, limit = 50) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.programs.list(offset, limit),
    queryFn: () =>
      api.get<PaginatedResponse<Program>>(
        `/programs?offset=${offset}&limit=${limit}`,
      ),
  })

  return {
    programs: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    refetch,
  }
}
