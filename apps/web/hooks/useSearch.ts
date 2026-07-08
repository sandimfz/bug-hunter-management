"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface SearchResults {
  programs: Array<{ id: number; uuid: string; name: string; platform: string }>
  assets: Array<{ id: number; uuid: string; programId: number; programUuid: string; value: string; type: string }>
  findings: Array<{ id: number; uuid: string; assetId: number; title: string; severity: string }>
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () =>
      api.get<SearchResults>(`/search?q=${encodeURIComponent(query.trim())}`),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  })
}
