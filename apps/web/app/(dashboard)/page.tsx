"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { Analytics } from "@/components/dashboard/analytics"
import { useDashboardStats } from "@/hooks/useDashboardStats"

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Overview
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Bounty"
          value={isLoading ? "..." : `$${stats?.totalBounty ?? 0}`}
          sub={`${stats?.paidFindings ?? 0} paid findings`}
          accent="text-emerald-400"
        />
        <StatCard
          label="Programs"
          value={isLoading ? "..." : stats?.programs ?? 0}
          sub={`${stats?.activePrograms ?? 0} active`}
        />
        <StatCard
          label="Assets"
          value={isLoading ? "..." : stats?.assets ?? 0}
          sub="tracked targets"
        />
        <StatCard
          label="Findings"
          value={isLoading ? "..." : stats?.findings ?? 0}
          sub={`${stats?.criticalFindings ?? 0} critical`}
        />
      </div>

      <DashboardTabs />

      <p className="text-xs uppercase tracking-widest text-muted-foreground pt-4">
        Analytics
      </p>
      <Analytics />
    </div>
  )
}
