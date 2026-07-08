"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

interface NotificationSetting {
  id: number
  channel: string
  webhookUrl: string | null
  enabled: unknown
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notifications.settings,
    queryFn: () => api.get<NotificationSetting[]>("/notifications/settings"),
  })
}

export function useAddNotificationSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { channel: string; webhookUrl: string }) =>
      api.post("/notifications/settings", body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings,
      })
    },
  })
}

export function useDeleteNotificationSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      api.delete(`/notifications/settings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.settings,
      })
    },
  })
}
