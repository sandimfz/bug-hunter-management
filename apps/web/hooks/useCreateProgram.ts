"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"
import type { CreateProgramInput } from "@/lib/schemas/program"

interface Program {
  id: number
  uuid: string
  name: string
  platform: string
}

export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgramInput & { workspaceUuid: string }) =>
      api.post<Program>("/programs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all })
    },
  })
}
