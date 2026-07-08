"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
}

export function useAsset(uuid: string) {
  return useQuery({
    queryKey: queryKeys.assets.detail(uuid),
    queryFn: () => api.get<Asset>(`/assets/${uuid}`),
    enabled: !!uuid,
  })
}

export function useUpdateAsset(uuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: Partial<Asset>) =>
      api.put(`/assets/${uuid}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assets.detail(uuid),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.all })
    },
  })
}
