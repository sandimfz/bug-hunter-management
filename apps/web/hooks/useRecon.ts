"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

export function useTriggerScan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ programId, domain }: { programId: number; domain: string }) =>
      api.post<{ imported: number; total: number }>(
        `/recon/scan/${programId}`,
        { domain },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all })
    },
  })
}
