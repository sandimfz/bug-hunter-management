export interface User {
  id: number
  email: string
  name: string
  plan: "free" | "pro" | "team"
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: number
  name: string
  ownerId: number
  createdAt: string
  updatedAt: string
}

export interface Program {
  id: number
  workspaceId: number
  name: string
  platform: "hackerone" | "bugcrowd" | "private" | "other"
  status: "active" | "paused" | "completed"
  scopeNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: number
  programId: number
  type: "domain" | "subdomain" | "endpoint" | "api" | "ip"
  value: string
  status: "active" | "dead" | "unchecked" | "flagged"
  tags: string[] | null
  notes: string | null
  firstSeenAt: string
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}

export interface Finding {
  id: number
  assetId: number
  title: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  status: "draft" | "submitted" | "triaged" | "accepted" | "rejected" | "paid"
  poc: string | null
  rewardAmount: number | null
  createdAt: string
  updatedAt: string
}
