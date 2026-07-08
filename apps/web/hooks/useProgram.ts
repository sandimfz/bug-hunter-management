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
}

interface Snapshot {
  id: number
  programId: number
  scanDate: string
  totalAssets: number
  newAssets: number
  removedAssets: number
  newValues: string[]
  removedValues: string[]
}

export function useProgram(uuid: string) {
  return useQuery({
    queryKey: queryKeys.programs.detail(uuid),
    queryFn: () => api.get<Program>(`/programs/${uuid}`),
    enabled: !!uuid,
  })
}

export function useProgramSnapshots(uuid: string) {
  return useQuery({
    queryKey: queryKeys.recon.snapshots(uuid),
    queryFn: () => api.get<Snapshot[]>(`/recon/snapshots/${uuid}`),
    enabled: !!uuid,
  })
}
