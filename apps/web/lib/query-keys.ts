export const queryKeys = {
  programs: {
    all: ["programs"] as const,
    list: (offset: number, limit: number) =>
      ["programs", "list", offset, limit] as const,
    detail: (uuid: string) => ["programs", "detail", uuid] as const,
  },
  assets: {
    all: ["assets"] as const,
    list: (programId?: number, offset?: number, limit?: number) =>
      ["assets", "list", { programId, offset, limit }] as const,
    detail: (uuid: string) => ["assets", "detail", uuid] as const,
  },
  findings: {
    all: ["findings"] as const,
    list: (assetId?: number, offset?: number, limit?: number) =>
      ["findings", "list", { assetId, offset, limit }] as const,
    byAsset: (assetUuid: string) => ["findings", "byAsset", assetUuid] as const,
  },
  stats: {
    dashboard: ["stats", "dashboard"] as const,
    bounty: ["stats", "bounty"] as const,
    analytics: ["stats", "analytics"] as const,
  },
  search: (query: string) => ["search", query] as const,
  notifications: {
    settings: ["notifications", "settings"] as const,
  },
  workspaces: {
    list: ["workspaces"] as const,
    byOwner: (ownerId: number) => ["workspaces", "owner", ownerId] as const,
  },
  recon: {
    snapshots: (programUuid: string) =>
      ["recon", "snapshots", programUuid] as const,
  },
} as const
