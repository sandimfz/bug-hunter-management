"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { useBountyStats } from "@/hooks/useBountyStats"

const severityColors: Record<string, string> = {
  critical: "border border-red-500/30 bg-red-500/15 text-red-400",
  high: "border border-orange-500/30 bg-orange-500/15 text-orange-400",
  medium: "border border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  low: "border border-blue-500/30 bg-blue-500/15 text-blue-400",
  info: "border border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
}

export default function BountyPage() {
  const { data: stats, isLoading } = useBountyStats()

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Bounty Tracker</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Earned" value={isLoading ? "..." : `$${stats?.totalEarned ?? 0}`} sub="All time" accent="text-emerald-400" />
        <StatCard label="This Month" value={isLoading ? "..." : `$${stats?.paidThisMonth ?? 0}`} sub="paid this month" accent="text-emerald-400" />
        <StatCard label="Pending" value={isLoading ? "..." : `$${stats?.pendingAmount ?? 0}`} sub="awaiting payment" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-mono">Recent Paid Findings</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground font-mono">Loading...</p>
          ) : !stats?.recentPaid || stats.recentPaid.length === 0 ? (
            <p className="text-sm text-muted-foreground">No earnings yet. Start finding vulnerabilities to earn bounties.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Title</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Severity</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Reward</th>
                    <th className="text-left text-xs uppercase tracking-widest text-muted-foreground py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPaid.map((f) => (
                    <tr key={f.id} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3 px-4 text-sm text-foreground font-mono">{f.title}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`text-[10px] ${severityColors[f.severity] ?? ""}`}>{f.severity}</Badge></td>
                      <td className="py-3 px-4 text-sm text-emerald-400 font-mono">${f.rewardAmount}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(f.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
