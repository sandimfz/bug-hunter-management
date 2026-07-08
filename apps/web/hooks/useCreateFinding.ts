"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { CreateFindingInput } from "@/lib/schemas/finding"

export function useCreateFinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<CreateFindingInput, "rewardAmount"> & { assetUuid: string; rewardAmount?: number }) =>
      api.post("/findings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.findings.all })
    },
  })
}
